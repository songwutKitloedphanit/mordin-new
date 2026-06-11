import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import * as Papa from 'papaparse';
import { CalculationService } from 'src/common/calculation/calculation.service';
import { LaboratorySetting } from 'src/laboratory/laboratory-settings/entities/laboratory-setting.entity';
import { ServiceLaboratory } from 'src/service-type/service-laboratories/entities/service-laboratory.entity';
import { AnalysisStandardResultsService } from 'src/standard-sample/analysis-standard-results/analysis-standard-results.service';
import { StandardCertificatesService } from 'src/standard-sample/standard-certificates/standard-certificates.service';
import { DataSource, EntityManager, In, Repository } from 'typeorm';

import { Book } from '../books/entities/book.entity';

import { CreateResultDto } from './dto/create-result.dto';
import { InputResultDto } from './dto/input-result.dto';
import { UpdateResultDto } from './dto/update-result.dto';
import { Result } from './entities/result.entity';
import { ResultLog } from './entities/result.log.entity';

export interface CsvProcessingError {
  row: number; // แถวในไฟล์ CSV (เริ่มนับจาก 2)
  sampleCode: string;
  error: string;
}

export interface CsvProcessingResult {
  success: boolean;
  summary: {
    totalRowsInCsv: number;
    processedRows: number;
    updatedCount: number;
    failedRows: number;
  };
  errors: CsvProcessingError[];
  data: Result[]; // ส่งข้อมูลที่อัปเดตสำเร็จกลับไปด้วย
}
interface MixedCsvRow {
  sampleCode: string;
  type: 'sample' | 'blank' | 'crm';
  [key: string]: string | undefined;
}

@Injectable()
export class ResultsService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,

    @InjectRepository(Result)
    private readonly resultRepo: Repository<Result>,

    @InjectRepository(ResultLog)
    private readonly resultLog: Repository<ResultLog>,

    @InjectRepository(LaboratorySetting)
    private readonly labSettingRepo: Repository<LaboratorySetting>,

    @InjectRepository(ServiceLaboratory)
    private readonly servLabRepo: Repository<ServiceLaboratory>,

    @InjectRepository(Book)
    private readonly bookRepo: Repository<Book>,

    private readonly calculationService: CalculationService,
    private readonly analysisStandardResultsService: AnalysisStandardResultsService,
    private readonly standardCertificatesService: StandardCertificatesService
  ) {}

  // Helper แปลง JSON rows กลับเป็น CSV string
  private convertToCsv(rows: any[]): Buffer {
    const csv = Papa.unparse(rows);
    return Buffer.from(csv, 'utf-8');
  }

  async updateResultFromPreValue(
    inputs: InputResultDto[],
    Uid: number
  ): Promise<Result[]> {
    // หุ้มด้วย Transaction เพื่อความปลอดภัยของข้อมูล
    return this.dataSource.transaction(async entityManager => {
      const resultRepo = entityManager.getRepository(Result);

      const resultIds = inputs.map(input => input.resultId);
      const preValueMap = new Map(inputs.map(i => [i.resultId, i.preValue]));

      const results = await resultRepo.find({
        where: { resultId: In(resultIds) },
        // เราต้องโหลด relations ทั้งหมดที่ CalculationService ต้องการ
        relations: {
          laboratorySetting: {
            laboratory: { machineType: true },
            laboratorySettingDetails: true,
          },
          book: {
            qrCode: true,
            serviceType: {
              serviceCategories: true,
            },
          },
        },
      });

      if (results.length !== resultIds.length) {
        throw new NotFoundException('Some result IDs could not be found.');
      }

      const updatedResults = results.map(result => {
        const preValue = preValueMap.get(result.resultId)!;
        result.preValue = preValue;
        result.recordedAt = Date.now();
        result.recordedUid = Uid;

        // เช็ค laboratorySettingDetails เฉพาะแลป OM และ P เท่านั้น
        const labShortName =
          result.laboratorySetting.laboratory.shortNameBefore;
        const requiresSettingDetails =
          labShortName === 'OM' || labShortName === 'P';

        if (requiresSettingDetails) {
          const hasValidDetails =
            result.laboratorySetting.laboratorySettingDetails &&
            result.laboratorySetting.laboratorySettingDetails.length > 0 &&
            result.laboratorySetting.laboratorySettingDetails.every(
              detail =>
                detail.workingStandard !== null && detail.absorbance !== null
            );

          if (!hasValidDetails) {
            throw new HttpException(
              'กรุณาตั้งค่าใน Step3-Analysis Setting ให้ครบถ้วนก่อนทำการบันทึกผล',
              HttpStatus.BAD_REQUEST
            );
          }
        }

        return result;
      });

      // เรียก calculateResults (เวอร์ชันที่เร็วแล้ว) พร้อมส่ง entityManager เข้าไป
      return this.calculationService.calculateResults(
        updatedResults,
        entityManager
      );
    });
  }

  async processCsvWithMixedTypes(
    csvBuffer: Buffer,
    serviceCalendarId: number
  ): Promise<{
    sample: CsvProcessingResult;
    blank: { updatedCount: number; errors: any[] };
    crm: { updatedCount: number; errors: any[] };
  }> {
    const text = csvBuffer.toString('utf8');
    const { data: rows } = Papa.parse<{
      sampleCode: string;
      type: string;
      [col: string]: string;
    }>(text, {
      header: true,
      skipEmptyLines: true,
    });

    const sampleRows = rows.filter(r => r.type === 'sample');
    const blankRows = rows.filter(r => r.type === 'blank');
    const crmRows = rows.filter(r => r.type === 'crm');

    // turn each back into a Buffer
    const makeBuf = (rs: any[]) => Buffer.from(Papa.unparse(rs), 'utf8');

    const sample = await this.processCsvAndUpdateResults(makeBuf(sampleRows));
    const blank = await this.analysisStandardResultsService.processBlankCsv(
      makeBuf(blankRows),
      serviceCalendarId
    );
    const crm = await this.analysisStandardResultsService.processCrmResultCsv(
      makeBuf(crmRows),
      serviceCalendarId
    );

    return { sample, blank, crm };
  }

  create(createResultDto: CreateResultDto, Uid: number) {
    return 'This action adds a new result';
  }

  findAll() {
    return this.resultRepo.find();
  }

  findAllByBookId(bookId: number) {
    return this.resultRepo.find({
      where: {
        bookId,
      },
      relations: {
        laboratorySetting: {
          laboratorySettingDetails: true,
          laboratory: {
            machineType: true,
          },
        },
        resultGradeLevel: true,
      },
    });
  }

  findOne(id: number) {
    return this.resultRepo.findOne({
      where: { resultId: id },
      relations: {
        laboratorySetting: {
          laboratory: {
            machineType: true,
          },
          laboratorySettingDetails: true,
        },
        book: {
          qrCode: true,
        },
        resultGradeLevel: true,
      },
    });
  }

  update(id: number, updateResultDto: UpdateResultDto, Uid: number) {
    return `This action updates a #${id} result`;
  }

  remove(id: number) {
    return `This action removes a #${id} result`;
  }

  async printAllSampleResultsInExperimentServiceCalendarId(
    experimentServiceCalendarId: number
  ) {
    const books = await this.resultRepo.find({
      where: {
        book: {
          analysisServiceCalendarId: experimentServiceCalendarId,
        },
      },
    });

    for (const book of books) {
      const results = await this.resultRepo.find({
        where: {
          bookId: book.bookId,
        },
        relations: {
          laboratorySetting: {
            laboratory: true,
          },
        },
        order: {
          laboratorySetting: {
            laboratoryId: 'ASC',
          },
        },
      });
    }
  }

  async createBlankResultByBook(book: Book, repeatCount: number) {
    const servLabs = await this.servLabRepo.find({
      where: {
        serviceTypeId: book.serviceTypeId,
        isDisplay: true,
      },
    });
    for (let i = 1; i <= repeatCount; i++) {
      for (const serLab of servLabs) {
        const labSetting = await this.labSettingRepo.findOne({
          where: {
            laboratoryId: serLab.laboratoryId,
            serviceCalendarId: book.analysisServiceCalendarId,
          },
        });
        if (!labSetting)
          return console.log(
            'ยังมี bug อยู่ไม่เจอ lab settings ของ service calendars นั้นๆ (อาจจะยังทำ Auto gen ไม่ครบ)'
          );
        const result = this.resultRepo.create({
          bookId: book.bookId,
          laboratorySettingId: labSetting.laboratorySettingId,
          laboratoryId: serLab.laboratoryId,
          serviceTypeId: book.serviceTypeId,
          preValue: 0,
          postValue: 0,
          repeatNumber: i,
        });
        await this.resultRepo.save(result);
      }
    }
    return await this.resultRepo.find({
      where: {
        bookId: book.bookId,
      },
    });
  }

  async processCsvAndUpdateResults(
    csvBuffer: Buffer
  ): Promise<CsvProcessingResult> {
    // หุ้มการทำงานทั้งหมดด้วย Transaction ของ TypeORM
    return this.dataSource.transaction(async entityManager => {
      // ใช้ Repository ที่ผูกกับ Transaction นี้เท่านั้น
      const bookRepo = entityManager.getRepository(Book);

      const errors: CsvProcessingError[] = [];
      const resultsToCalculate: Result[] = [];
      const updatedResultIds = new Set<number>();

      const csvString = csvBuffer.toString('utf-8');
      const parsedCsv = Papa.parse(csvString, {
        header: true,
        skipEmptyLines: true,
      });
      const csvData = parsedCsv.data;

      // --- Pre-computation and Validation ---
      const processedData = csvData
        .map((row: any, index) => {
          const [baseSampleCode, repeatStr] = String(
            row.sampleCode || ''
          ).split('/');
          return {
            rowNumber: index + 2, // +1 for zero-based index, +1 for header row
            baseSampleCode,
            repeatNumber: repeatStr ? parseInt(repeatStr, 10) : 1,
            originalRow: row,
          };
        })
        .filter(item => item.baseSampleCode);

      const uniqueBaseSampleCodes = [
        ...new Set(processedData.map(d => d.baseSampleCode)),
      ];
      if (uniqueBaseSampleCodes.length === 0) {
        throw new BadRequestException(
          'CSV does not contain any valid sample codes.'
        );
      }

      const books = await bookRepo.find({
        where: { sampleCode: In(uniqueBaseSampleCodes) },
        relations: {
          results: {
            laboratorySetting: {
              laboratory: {
                machineType: true,
              },
            },
            book: {
              qrCode: true,
              serviceType: {
                serviceCategories: true,
              },
            },
          },
          // qrCode: true,
          // serviceType: {
          //   serviceCategories: true
          // }
        },
      });
      const bookMap = new Map(books.map(b => [b.sampleCode, b]));

      // --- Main Processing Loop ---
      for (const item of processedData) {
        const { rowNumber, baseSampleCode, repeatNumber, originalRow } = item;

        const targetBook = bookMap.get(baseSampleCode);
        if (!targetBook) {
          errors.push({
            row: rowNumber,
            sampleCode: originalRow.sampleCode,
            error: `Sample Code '${baseSampleCode}' not found in the system.`,
          });
          continue; // ข้ามไปทั้งแถวถ้าไม่เจอ Book
        }

        for (const header in originalRow) {
          const valueStr = originalRow[header];
          if (
            header === 'sampleCode' ||
            header === 'type' ||
            !valueStr ||
            String(valueStr).trim() === ''
          )
            continue;

          // Validate if value is a number

          const preValue = parseFloat(valueStr);
          if (isNaN(preValue)) {
            errors.push({
              row: rowNumber,
              sampleCode: originalRow.sampleCode,
              error: `Invalid non-numeric value '${valueStr}' for Lab '${header}'.`,
            });
            continue;
          }

          const headerMatch = header.match(/(.*) \((.*)\)/);
          if (!headerMatch) continue; // ข้าม header ที่ไม่ตรง pattern "ชื่อ (หน่วย)"

          const [parsedShortName, parsedUnit] = [
            headerMatch[1].trim(),
            headerMatch[2].trim(),
          ];

          const targetResult = targetBook.results.find(
            res =>
              res.repeatNumber === repeatNumber &&
              res.laboratorySetting.laboratory.shortNameBefore.toLowerCase() ===
                parsedShortName.toLowerCase() &&
              res.laboratorySetting.laboratory.unitBefore.toLowerCase() ===
                parsedUnit.toLowerCase()
          );

          if (targetResult) {
            if (!updatedResultIds.has(targetResult.resultId)) {
              targetResult.preValue = preValue;
              targetResult.recordedAt = Date.now();
              resultsToCalculate.push(targetResult);
              updatedResultIds.add(targetResult.resultId);
            }
          } else {
            errors.push({
              row: rowNumber,
              sampleCode: originalRow.sampleCode,
              error: `Lab result for '${header}' (Repeat #${repeatNumber}) not found.`,
            });
          }
        }
      }

      // --- Final Calculation and Saving ---
      let calculatedData: Result[] = [];
      if (resultsToCalculate.length > 0) {
        // ส่ง entityManager เข้าไปใน service ที่จะทำการ save ข้อมูลด้วย
        calculatedData = await this.calculationService.calculateResults(
          resultsToCalculate,
          entityManager
        );
      }

      // --- Construct Final Response ---
      const totalRowsInCsv = csvData.length;
      const failedRows = new Set(errors.map(e => e.row)).size;

      return {
        success: true,
        summary: {
          totalRowsInCsv,
          processedRows: processedData.length,
          updatedCount: calculatedData.length,
          failedRows,
        },
        errors,
        data: calculatedData,
      };
    });
  }

  /**
   * [NEW] เมธอดสำหรับสร้าง blank results ให้กับ book หลายๆ เล่มพร้อมกันแบบ Bulk
   */
  async createBlankResultsForBooksBulk(books: Book[], manager: EntityManager) {
    // ใช้ Repository จาก Transaction
    const servLabRepo = manager.getRepository(ServiceLaboratory);
    const labSettingRepo = manager.getRepository(LaboratorySetting);
    const resultRepo = manager.getRepository(Result);

    // --- 1. Pre-fetch ข้อมูลที่ต้องใช้ทั้งหมดใน Query เดียว ---
    const serviceTypeIds = [...new Set(books.map(b => b.serviceTypeId))];
    const analysisCalendarIds = [
      ...new Set(books.map(b => b.analysisServiceCalendarId)),
    ];

    const [allServLabs, allLabSettings] = await Promise.all([
      servLabRepo.find({
        where: { serviceTypeId: In(serviceTypeIds), isDisplay: true },
      }),
      labSettingRepo.find({
        where: { serviceCalendarId: In(analysisCalendarIds) },
      }),
    ]);

    // --- 2. สร้าง Map เพื่อการค้นหาที่รวดเร็วใน Memory ---
    const servLabsMap = new Map<number, ServiceLaboratory[]>();
    for (const sl of allServLabs) {
      if (!servLabsMap.has(sl.serviceTypeId))
        servLabsMap.set(sl.serviceTypeId, []);
      servLabsMap.get(sl.serviceTypeId)!.push(sl);
    }

    const labSettingsMap = new Map<string, LaboratorySetting>();
    for (const ls of allLabSettings) {
      const key = `${ls.serviceCalendarId}-${ls.laboratoryId}`;
      labSettingsMap.set(key, ls);
    }

    // --- 3. สร้าง Entities ทั้งหมดใน Memory ---
    const resultsToCreate: Result[] = [];
    for (const book of books) {
      const servLabs = servLabsMap.get(book.serviceTypeId) ?? [];
      for (let i = 1; i <= book.repeatCount; i++) {
        for (const serLab of servLabs) {
          const key = `${book.analysisServiceCalendarId}-${serLab.laboratoryId}`;
          const labSetting = labSettingsMap.get(key);

          if (labSetting) {
            const result = resultRepo.create({
              bookId: book.bookId,
              laboratorySettingId: labSetting.laboratorySettingId,
              laboratoryId: serLab.laboratoryId,
              serviceTypeId: book.serviceTypeId,
              preValue: 0,
              postValue: 0,
              repeatNumber: i,
            });
            resultsToCreate.push(result);
          }
        }
      }
    }

    // --- 4. Bulk Save ข้อมูลทั้งหมดในครั้งเดียว ---
    if (resultsToCreate.length > 0) {
      await resultRepo.save(resultsToCreate, { chunk: 200 }); // chunk ช่วยจัดการข้อมูลจำนวนมาก
    }
  }

  getLogs() {
    return this.resultLog.find();
  }
}
