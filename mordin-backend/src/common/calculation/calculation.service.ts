// src/common/calculation/calculation.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Decimal from 'decimal.js';
import {
  linearRegression,
  linearRegressionLine,
  rSquared,
} from 'simple-statistics';
import { MachineTypeTypes } from 'src/laboratory/enums/machine-type.enum';
import { LaboratorySettingDetail } from 'src/laboratory/laboratory-setting-details/entities/laboratory-setting-detail.entity';
import { LaboratorySetting } from 'src/laboratory/laboratory-settings/entities/laboratory-setting.entity';
import { ResultGradeLevel } from 'src/result-grade/result-grade-levels/entities/result-grade-level.entity';
import { ResultGrade } from 'src/result-grade/result-grades/entities/result-grade.entity';
import { Book } from 'src/sample/books/entities/book.entity';
import { SampleStatusEnum } from 'src/sample/enums/qr-code.enum';
import { FertilizerMajorLandUsagesService } from 'src/sample/fertilizer-major-land-usages/fertilizer-major-land-usages.service';
import { FertilizerMinorLandUsagesService } from 'src/sample/fertilizer-minor-land-usages/fertilizer-minor-land-usages.service';
import { QrCode } from 'src/sample/qr-codes/entities/qr-code.entity';
import { Result } from 'src/sample/results/entities/result.entity';
import { EntityManager, In, Repository } from 'typeorm';

@Injectable()
export class CalculationService {
  constructor(
    @InjectRepository(Result)
    private readonly resultRepo: Repository<Result>,
    @InjectRepository(QrCode)
    private readonly qrCodeRepo: Repository<QrCode>,
    @InjectRepository(ResultGrade)
    private readonly resultGradeRepo: Repository<ResultGrade>,
    @InjectRepository(ResultGradeLevel)
    private readonly resultGradeLevelRepo: Repository<ResultGradeLevel>,
    private readonly ferMajorLandUsagesService: FertilizerMajorLandUsagesService,
    private readonly ferMinorLandUsagesService: FertilizerMinorLandUsagesService
  ) {}

  private async runBulkSummaries(
    savedResults: Result[],
    manager: EntityManager
  ) {
    const qrCodeRepo = manager.getRepository(QrCode);
    const resultRepo = manager.getRepository(Result);

    // --- STEP 1: รวบรวม Book ID ทั้งหมดที่ได้รับผลกระทบใน Batch นี้ ---
    const affectedBookIds = [
      ...new Set(savedResults.map(result => result.bookId)),
    ];
    if (affectedBookIds.length === 0) {
      return; // ไม่มี Book ที่ต้องตรวจสอบ
    }

    // --- STEP 2: ดึง "Result ทั้งหมด" ของ Book ที่ได้รับผลกระทบ เพื่อตรวจสอบสถานะที่แท้จริง ---
    // เราต้องการ full entity เพื่อส่งไปให้ summary services ต่อไป
    const allResultsOfAffectedBooks = await resultRepo.find({
      where: { bookId: In(affectedBookIds) },
    });

    // --- STEP 3: จัดกลุ่ม Result ทั้งหมดตาม bookId เพื่อง่ายต่อการตรวจสอบ ---
    const allResultsMap = new Map<number, Result[]>();
    for (const result of allResultsOfAffectedBooks) {
      if (!allResultsMap.has(result.bookId)) {
        allResultsMap.set(result.bookId, []);
      }
      allResultsMap.get(result.bookId)!.push(result);
    }

    // --- STEP 4: ค้นหา Book ที่คำนวณเสร็จสมบูรณ์ (มี postValue ทุกรายการ) ---
    const completedBooksData: { book: Book; results: Result[] }[] = [];

    // เราต้องการ book object ที่มี relations ครบถ้วนสำหรับส่งไป summary
    // เราสามารถดึงมาจาก savedResults ที่มี relation โหลดมาเรียบร้อยแล้วได้
    const bookObjectsMap = new Map<number, Book>();
    for (const res of savedResults) {
      if (!bookObjectsMap.has(res.bookId)) {
        bookObjectsMap.set(res.bookId, res.book);
      }
    }

    for (const bookId of affectedBookIds) {
      const relatedResults = allResultsMap.get(bookId) || [];
      // .every() จะเช็คว่าสมาชิก "ทุกตัว" ใน Array เป็นจริงตามเงื่อนไขหรือไม่
      const isFullyAnalyzed =
        relatedResults.length > 0 &&
        relatedResults.every(
          r => r.postValue !== null && r.postValue !== undefined
        );

      if (isFullyAnalyzed) {
        const bookObject = bookObjectsMap.get(bookId);
        if (bookObject) {
          completedBooksData.push({
            book: bookObject,
            results: relatedResults,
          });
        }
      }
    }

    // --- STEP 5: หากมี Book ที่เสร็จสมบูรณ์ จึงค่อยดำเนินการต่อ ---
    if (completedBooksData.length > 0) {
      // 5A: เรียกใช้ Summary Services เฉพาะกับ Book ที่เสร็จแล้ว
      await Promise.all([
        this.ferMinorLandUsagesService.summaryFertilizerMinorLandUsagesBulk(
          completedBooksData,
          manager
        ),
        this.ferMajorLandUsagesService.summaryFertilizerMajorLandUsagesBulk(
          completedBooksData,
          manager
        ),
      ]);

      // 5B: อัปเดตสถานะ QrCode เฉพาะของ Book ที่เสร็จแล้ว
      const qrCodeIdsToUpdate = completedBooksData.map(
        item => item.book.qrCodeId
      );

      if (qrCodeIdsToUpdate.length > 0) {
        await qrCodeRepo.update(
          { qrCodeId: In(qrCodeIdsToUpdate) },
          { status: SampleStatusEnum.ANALYZED }
        );
      }
    }
  }

  // ... paste other calculation methods like calculatePComplex here ...
  private calculateRawValue(result: Result): number {
    return result.preValue;
  }

  // ... (วางโค้ดฟังก์ชันคำนวณย่อยทั้งหมดไว้ที่นี่) ...
  private calculateReverseLinear(result: Result): number {
    const { intercept, slope, extractConcentration, extractAmount } =
      result.laboratorySetting || {};

    const { dirtWeightOm } = result.book?.qrCode || {};
    const OMAbs = result.preValue;

    if (
      intercept === undefined ||
      slope === undefined ||
      extractConcentration === undefined ||
      extractAmount === undefined ||
      dirtWeightOm === undefined ||
      OMAbs === undefined
    ) {
      return 0;
    }

    const interceptD = new Decimal(intercept);
    const slopeD = new Decimal(slope);
    const extractConcentrationD = new Decimal(extractConcentration);
    const extractAmountD = new Decimal(extractAmount);
    const dirtWeightOmD = new Decimal(dirtWeightOm);
    const OMAbsD = new Decimal(OMAbs);

    const POXC = extractConcentrationD
      .minus(interceptD.plus(slopeD.times(OMAbsD)))
      .times(9000)
      .times(extractAmountD.div(dirtWeightOmD))
      .div(10000);

    const convertSlope = new Decimal(0.0122);
    const convertIntercept = new Decimal(0.0159);

    const OMPercent = POXC.minus(convertSlope).div(convertIntercept);

    return OMPercent.isNaN() ? 0 : OMPercent.toNumber();
  }

  private calculatePComplex(result: Result): number {
    const { intercept, slope, extractAmount } = result.laboratorySetting;
    const { dirtWeightMehlich } = result.book.qrCode;

    const preValue = new Decimal(result.preValue);
    const interceptD = new Decimal(intercept);
    const slopeD = new Decimal(slope);
    const extractAmountD = new Decimal(extractAmount);
    const dirtWeightMehlichD = new Decimal(dirtWeightMehlich);

    // calculateLinearRegression เก็บค่าแบบ: slope = regression intercept (b),
    // intercept = regression slope (m). Inverse calibration ที่ถูกต้องคือ
    // conc = (absorbance - b) / m = (preValue - slope) / intercept
    // (ของเดิมทำ (preValue - intercept)/slope → หารด้วย b ซึ่ง = 0 เมื่อเส้น
    //  calibration ผ่านจุด origin → Division by zero)
    const value = preValue
      .minus(slopeD)
      .div(interceptD)
      .times(25)
      .div(5)
      .times(extractAmountD.times(1000))
      .div(dirtWeightMehlichD.times(1000));

    // console.debug(`Calculated P Complex Value: ${value.toString()}`);

    return value.toNumber();
  }

  // ฟังก์ชันคำนวณย่อยๆ ไม่มีการเปลี่ยนแปลง (calculateLinearRegression, calculateRawValue, etc.)
  private calculateExtractRatio(result: Result): number {
    const extractAmountD = new Decimal(result.laboratorySetting.extractAmount);
    const dirtWeightMehlichD = new Decimal(
      result.book.qrCode.dirtWeightMehlich
    );
    const preValueD = new Decimal(result.preValue);

    const value = preValueD.times(extractAmountD).div(dirtWeightMehlichD);
    return value.toNumber();
  }

  calculateLinearRegression(labSetting: LaboratorySetting): {
    rSquare: number;
    slope: number;
    intercept: number;
  } {
    const data: [number, number][] = labSetting.laboratorySettingDetails.map(
      (detail: LaboratorySettingDetail) => {
        if (
          labSetting.laboratory.machineType.type ===
          MachineTypeTypes.REVERSE_LINEAR
        ) {
          return [detail.absorbance, detail.workingStandard];
        }
        return [detail.workingStandard, detail.absorbance];
      }
    );

    const linear = linearRegression(data);
    const predict = linearRegressionLine(linear);
    const rSquare = rSquared(data, predict);

    // OM (REVERSE_LINEAR): slope = m, intercept = b  → ใช้ใน (extractConc - (b + m×Abs))
    // P (P_COMPLEX):        slope = b, intercept = m  → ใช้ใน (Abs - m) / b  ตาม Excel convention
    const isReverseLinear =
      labSetting.laboratory.machineType.type ===
      MachineTypeTypes.REVERSE_LINEAR;
    return {
      rSquare,
      slope: isReverseLinear ? linear.m : linear.b,
      intercept: isReverseLinear ? linear.b : linear.m,
    };
  }

  // ... calculatePComplex, calculateReverseLinear, calculateExtractRatio ...

  calculatePostValue(result: Result): number {
    const machineType = result.laboratorySetting.laboratory.machineType.type;

    switch (machineType) {
      case MachineTypeTypes.RAW_VALUE:
        return this.calculateRawValue(result);

      case MachineTypeTypes.REVERSE_LINEAR:
        return this.calculateReverseLinear(result);

      case MachineTypeTypes.P_COMPLEX:
        return this.calculatePComplex(result);

      case MachineTypeTypes.EXTRACT_RATIO:
      default:
        return this.calculateExtractRatio(result);
    }
  }

  /**
   * [OPTIMIZED] เมธอดหลักที่ปรับปรุงใหม่ทั้งหมด
   */
  async calculateResults(
    results: Result[],
    manager: EntityManager
  ): Promise<Result[]> {
    console.time('calculateResults-total');

    // ใช้ repository จาก transaction
    const resultRepo = manager.getRepository(Result);
    const qrCodeRepo = manager.getRepository(QrCode);
    const resultGradeRepo = manager.getRepository(ResultGrade);
    const resultGradeLevelRepo = manager.getRepository(ResultGradeLevel);

    // --- STEP 1: Pre-fetch data to avoid N+1 queries (Corrected Logic) ---
    const laboratoryIds = [...new Set(results.map(r => r.laboratoryId))];

    // 1a. ดึง ResultGrade entities ที่เกี่ยวข้องออกมาก่อน
    const resultGrades = await resultGradeRepo.find({
      where: { laboratoryId: In(laboratoryIds) },
    });

    // 1b. จากนั้นรวบรวม resultGradeId จริงๆ จากข้อมูลที่ได้มา
    const resultGradeIds = resultGrades.map(rg => rg.resultGradeId);

    // 1c. ดึง ResultGradeLevel ทั้งหมดโดยใช้ resultGradeId ที่ถูกต้อง
    // และตรวจสอบก่อนว่ามี ID ให้ดึงหรือไม่
    let allResultGradeLevels: ResultGradeLevel[] = [];
    if (resultGradeIds.length > 0) {
      allResultGradeLevels = await resultGradeLevelRepo.find({
        where: { resultGradeId: In(resultGradeIds) },
      });
    }

    // Create Maps for fast lookups (O(1) access time)
    const resultGradeMap = new Map(
      resultGrades.map(rg => [`${rg.serviceTypeId}-${rg.laboratoryId}`, rg])
    );
    const gradeLevelsMap = new Map<number, ResultGradeLevel[]>();
    for (const level of allResultGradeLevels) {
      if (!gradeLevelsMap.has(level.resultGradeId)) {
        gradeLevelsMap.set(level.resultGradeId, []);
      }
      gradeLevelsMap.get(level.resultGradeId)!.push(level);
      gradeLevelsMap
        .get(level.resultGradeId)!
        .sort((a, b) => a.level - b.level);
    }

    // --- STEP 2: Calculate postValue and Grade in memory ---
    console.time('in-memory-calculation');
    results.forEach(result => {
      // ไม่ต้องมี index แล้วก็ได้
      result.postValue = this.calculatePostValue(result);

      // [แก้ไข] ใช้ Key แบบผสมในการค้นหาจาก Map
      const compositeKey = `${result.serviceTypeId}-${result.laboratoryId}`;
      const resultGrade = resultGradeMap.get(compositeKey);

      if (resultGrade) {
        const gradeLevels = gradeLevelsMap.get(resultGrade.resultGradeId);

        if (gradeLevels && gradeLevels.length > 0) {
          // Logic การหา Level ที่เหมาะสม (สำหรับค่า pH อาจต้องปรับปรุงเพิ่มเติม)
          const matchedLevel = gradeLevels.find(
            level => result.postValue <= level.cutoffValue
          );
          const selectedLevel =
            matchedLevel || gradeLevels[gradeLevels.length - 1];
          result.resultGradeId = selectedLevel.resultGradeId;
          result.resultLevel = selectedLevel.level;
        }
      }
    });
    console.timeEnd('in-memory-calculation');

    // --- STEP 3: Bulk save the updated results ---
    const savedResults = await resultRepo.save(results);

    // --- STEP 4: [NEW] Run summaries in bulk ONCE ---
    await this.runBulkSummaries(savedResults, manager);

    console.timeEnd('calculateResults-total');
    return savedResults;
  }
}
