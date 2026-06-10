import { Inject, Injectable } from '@nestjs/common';
import { CreateFertilizerMajorLandUsageDto } from './dto/create-fertilizer-major-land-usage.dto';
import { UpdateFertilizerMajorLandUsageDto } from './dto/update-fertilizer-major-land-usage.dto';
import { Book } from '../books/entities/book.entity';
import { Result } from '../results/entities/result.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FertilizerMajorLandUsage } from './entities/fertilizer-major-land-usage.entity';
import { EntityManager, In, Repository } from 'typeorm';
import { SoilGrade } from 'src/soil-grade/soil-grades/entities/soil-grade.entity';
import { FertilizerMajorLandScore } from '../fertilizer-major-land-scores/entities/fertilizer-major-land-score.entity';
import { UsageType } from 'src/fertilizer/usage-types/entities/usage-type.entity';
import { ServiceFertilizerMajorUsage } from 'src/fertilizer/service-fertilizer-major-usages/entities/service-fertilizer-major-usage.entity';
import { FertilizerMajorLandUsageLog } from './entities/fertilizer-major-land-usage.log.entity';

@Injectable()
export class FertilizerMajorLandUsagesService {
  constructor(
    @InjectRepository(FertilizerMajorLandUsage)
    private readonly ferMajorLandUsageRepo: Repository<FertilizerMajorLandUsage>,

    @InjectRepository(FertilizerMajorLandUsageLog)
    private readonly ferMajorLandUsageLog: Repository<FertilizerMajorLandUsageLog>,

    @InjectRepository(SoilGrade)
    private readonly soilGradeRepo: Repository<SoilGrade>,

    @InjectRepository(FertilizerMajorLandScore)
    private readonly ferMajorLandScoreRepo: Repository<FertilizerMajorLandScore>,

    @InjectRepository(UsageType)
    private readonly usageTypeRepo: Repository<UsageType>,

    @InjectRepository(ServiceFertilizerMajorUsage)
    private readonly serviceFerMajorUsageRepo: Repository<ServiceFertilizerMajorUsage>,
  ) { }

  /**
   * [NEW] Bulk processing version for Major Fertilizer summary.
   */
  async summaryFertilizerMajorLandUsagesBulk(
    booksToSummarize: { book: Book; results: Result[] }[],
    manager: EntityManager,
  ) {
    const bookIds = booksToSummarize.map(item => item.book.bookId);
    if (bookIds.length === 0) return;

    // --- Repositories from transaction ---
    const ferMajorLandUsageRepo = manager.getRepository(FertilizerMajorLandUsage);
    const ferMajorLandScoreRepo = manager.getRepository(FertilizerMajorLandScore);
    const soilGradeRepo = manager.getRepository(SoilGrade);
    const serviceFerMajorUsageRepo = manager.getRepository(ServiceFertilizerMajorUsage);
    const usageTypeRepo = manager.getRepository(UsageType);

    // --- STEP 1: Bulk Delete existing data ---
    await ferMajorLandUsageRepo.delete({ bookId: In(bookIds) });
    await ferMajorLandScoreRepo.delete({ bookId: In(bookIds) });

    // --- STEP 2: Pre-fetch all necessary reference data in bulk ---
    const serviceTypeIds = [...new Set(booksToSummarize.map(item => item.book.serviceTypeId))];
    const allServiceCategoryIds = booksToSummarize.flatMap(item => item.book.serviceType.serviceCategories.map(sc => sc.serviceCategoryId));

    const [allSoilGrades, allServiceFertilizerMajorUsages, allUsageTypes] = await Promise.all([
      soilGradeRepo.find({
        where: { serviceTypeId: In(serviceTypeIds) },
        relations: { soilGradeLevels: true, laboratory: true },
        order: { soilGradeLevels: { level: 'ASC' } },
      }),
      serviceFerMajorUsageRepo.find({
        where: { serviceCategoryId: In(allServiceCategoryIds) },
        relations: { fertilizerMajor: true },
      }),
      usageTypeRepo.find(),
    ]);

    // --- STEP 3: Create Maps for fast lookups ---
    const soilGradesMap = new Map<number, SoilGrade[]>();
    for (const sg of allSoilGrades) {
      if (!soilGradesMap.has(sg.serviceTypeId)) soilGradesMap.set(sg.serviceTypeId, []);
      soilGradesMap.get(sg.serviceTypeId)!.push(sg);
    }
    const serviceUsageMap = new Map<string, ServiceFertilizerMajorUsage>();
    for (const usage of allServiceFertilizerMajorUsages) {
      const key = `${usage.serviceCategoryId}-${usage.usageTypeId}-${usage.soilGradeLevelId}`;
      serviceUsageMap.set(key, usage);
    }

    // --- STEP 4: Process scores in memory and collect entities to be created ---
    const allNewScoresToCreate: FertilizerMajorLandScore[] = [];
    const totalScoreRecordsToCreate: { book: Book, totalScoreEntity: FertilizerMajorLandScore, totalScore: number }[] = [];

    for (const { book, results } of booksToSummarize) {
      const soilGrades = soilGradesMap.get(book.serviceTypeId) ?? [];
      let totalScore = 0;

      console.log(`\n--- Calculating Scores for Book ID: ${book.bookId} (Sample: ${book.sampleCode}) ---`);

      const soilGradeForTotal = soilGrades.find(sg => sg.laboratoryId === null || sg.parameter === 'Total Score');
      if (!soilGradeForTotal) continue;

      // Calculate scores for each lab result
      for (const soilGrade of soilGrades) {
        if (soilGrade.laboratoryId === null) continue; // Skip total score grade for now

        const refResult = results.find(result => result.laboratoryId === soilGrade.laboratoryId);
        if (refResult) {
          const selectedLevel = soilGrade.soilGradeLevels.find(level => refResult.postValue <= level.cutoffValue) || soilGrade.soilGradeLevels[soilGrade.soilGradeLevels.length - 1];

          // [UPDATED] Hardcode filter: Only allow OM, P, K, pH to contribute to Total Score
          const ALLOWED_LABS = ['OM', 'P', 'K', 'pH'];
          const labName = soilGrade.laboratory ? soilGrade.laboratory.shortNameBefore : 'Unknown';

          if (soilGrade.laboratory && ALLOWED_LABS.includes(labName)) {
            totalScore += selectedLevel.score;
            console.log(`   [INCLUDE] Lab: ${labName}, PostValue: ${refResult.postValue}, Score: ${selectedLevel.score}, Current Total: ${totalScore}`);
          } else {
            console.log(`   [SKIP]    Lab: ${labName}, PostValue: ${refResult.postValue}, Score: ${selectedLevel.score} (Not in allowed list)`);
          }

          const scoreEntity = ferMajorLandScoreRepo.create({
            soilGradeId: soilGrade.soilGradeId,
            bookId: book.bookId,
            resultId: refResult.resultId,
            soilGradeLevelId: selectedLevel.soilGradeLevelId,
            resultValue: selectedLevel.score,
            updatedUid: 1,
          });
          allNewScoresToCreate.push(scoreEntity);
        }
      }
      console.log(`   >>> FINAL TOTAL SCORE: ${totalScore}`);

      // Determine level for total score
      const selectedTotalLevel = soilGradeForTotal.soilGradeLevels.find(level => totalScore <= level.cutoffValue) || soilGradeForTotal.soilGradeLevels[soilGradeForTotal.soilGradeLevels.length - 1];

      const totalScoreEntity = ferMajorLandScoreRepo.create({
        soilGradeId: soilGradeForTotal.soilGradeId,
        bookId: book.bookId,
        soilGradeLevelId: selectedTotalLevel.soilGradeLevelId,
        resultValue: totalScore,
        updatedUid: 1,
      });
      allNewScoresToCreate.push(totalScoreEntity);

      // Keep track of the total score entity for this book to link it later
      totalScoreRecordsToCreate.push({ book, totalScoreEntity, totalScore });
    }

    // --- STEP 5: Bulk save all score entities to get their database-generated IDs ---
    await ferMajorLandScoreRepo.save(allNewScoresToCreate, { chunk: 100 });

    // --- STEP 6: Process usages in memory using the now-saved score entities ---
    const allNewUsagesToCreate: FertilizerMajorLandUsage[] = [];
    for (const { book, totalScoreEntity } of totalScoreRecordsToCreate) {
      const soilGradeForTotal = (soilGradesMap.get(book.serviceTypeId) ?? []).find(sg => sg.laboratoryId === null);
      if (!soilGradeForTotal) continue;

      const totalScoreLevelId = totalScoreEntity.soilGradeLevelId;

      for (const servCat of book.serviceType.serviceCategories) {
        for (const type of allUsageTypes) {
          const key = `${servCat.serviceCategoryId}-${type.usageTypeId}-${totalScoreLevelId}`;
          const serviceFerMajorUsage = serviceUsageMap.get(key);

          if (serviceFerMajorUsage) {
            const useRate = serviceFerMajorUsage.volume * serviceFerMajorUsage.fertilizerMajor.quantity;
            const costPerRai = useRate / serviceFerMajorUsage.fertilizerMajor.quantity * serviceFerMajorUsage.fertilizerMajor.price;

            const usageEntity = ferMajorLandUsageRepo.create({
              serviceFertilizerMajorUsageId: serviceFerMajorUsage.serviceFertilizerMajorUsageId,
              bookId: book.bookId,
              totalScoreId: totalScoreEntity.fertilizerMajorLandScoreId, // Use the real ID
              fertilizerMajorId: serviceFerMajorUsage.fertilizerMajorId,
              grade: totalScoreEntity.resultValue,
              gradeText: (soilGradeForTotal.soilGradeLevels.find(l => l.soilGradeLevelId === totalScoreLevelId))?.scoreName,
              formula: serviceFerMajorUsage.fertilizerMajor.formular,
              useRate: useRate,
              costPerRai: costPerRai,
            });
            allNewUsagesToCreate.push(usageEntity);
          }
        }
      }
    }

    // --- STEP 7: Bulk save all new usage entities ---
    if (allNewUsagesToCreate.length > 0) {
      await ferMajorLandUsageRepo.save(allNewUsagesToCreate, { chunk: 100 });
    }
  }


  async summaryFertilizerMajorLandUsages(book: Book, results: Result[]) {
    await this.ferMajorLandUsageRepo.delete({
      bookId: book.bookId,
    });
    await this.ferMajorLandScoreRepo.delete({
      bookId: book.bookId,
    });
    const { serviceType } = book;
    const serviceCategories = serviceType.serviceCategories;
    const soilGrades = await this.soilGradeRepo.find({
      where: {
        serviceTypeId: book.serviceTypeId,
      },
      relations: {
        soilGradeLevels: true,
        laboratory: true,
      },
      order: {
        soilGradeLevels: {
          level: 'ASC',
        }
      }
    });

    const serviceFertilizerMajorUsages = await this.serviceFerMajorUsageRepo.find({
      where: {
        serviceCategoryId: In(serviceCategories.map(cat => cat.serviceCategoryId)),
      },
      relations: {
        fertilizerMajor: true,
      },
    });

    let totalScore = 0;
    console.log(`\n--- Calculating Scores for Book ID: ${book.bookId} (Single Calc) ---`);
    let ferMajorLandScores: FertilizerMajorLandScore[] = [];
    for (const soilGrade of soilGrades) {
      const refResult = results.find(result => result.laboratoryId === soilGrade.laboratoryId);
      if (refResult) {
        // หาการใช้ปุ๋ยที่ตรงกับผลลัพธ์
        const matchedLevel = soilGrade.soilGradeLevels.find(
          level => refResult.postValue <= level.cutoffValue
        );

        // หากค่ามากกว่าทุก cutoffValue ให้ใช้ค่า cutoffValue สุดท้าย
        const selectedLevel = matchedLevel || soilGrade.soilGradeLevels[soilGrade.soilGradeLevels.length - 1];

        const ferMajorLandScore = this.ferMajorLandScoreRepo.create({
          soilGradeId: soilGrade.soilGradeId,
          bookId: book.bookId,
          resultId: refResult.resultId,
          soilGradeLevelId: selectedLevel.soilGradeLevelId,
          resultValue: selectedLevel.score,
          updatedUid: 1, // Mocked updatedUid, should be replaced with actual user ID
        });
        const savedFerMajorLandScore = await this.ferMajorLandScoreRepo.save(ferMajorLandScore);
        ferMajorLandScores.push(savedFerMajorLandScore);

        // [UPDATED] Hardcode filter: Only allow OM, P, K, pH to contribute to Total Score
        const ALLOWED_LABS = ['OM', 'P', 'K', 'pH'];
        const labName = soilGrade.laboratory ? soilGrade.laboratory.shortNameBefore : 'Unknown';

        if (soilGrade.laboratory && ALLOWED_LABS.includes(labName)) {
          totalScore += selectedLevel.score;
          console.log(`   [INCLUDE] Lab: ${labName}, PostValue: ${refResult.postValue}, Score: ${selectedLevel.score}, Current Total: ${totalScore}`);
        } else {
          console.log(`   [SKIP]    Lab: ${labName}, PostValue: ${refResult.postValue}, Score: ${selectedLevel.score} (Not in allowed list)`);
        }
      }
    }
    console.log(`   >>> FINAL TOTAL SCORE: ${totalScore}`);

    const soilGradeTotal = soilGrades.find(soilGrade => soilGrade.laboratoryId === null || soilGrade.parameter === 'Total Score');
    if (!soilGradeTotal) {
      throw new Error('Soil grade for Total Score not found');
    }
    const matchedTotalLevel = soilGradeTotal.soilGradeLevels.find(
      level => totalScore <= level.cutoffValue
    );
    // หากค่ามากกว่าทุก cutoffValue ให้ใช้ค่า cutoffValue สุดท้าย
    const selectedTotalLevel = matchedTotalLevel || soilGradeTotal.soilGradeLevels[soilGradeTotal.soilGradeLevels.length - 1];
    // สร้าง FertilizerMajorLandUsage สำหรับ Total Score
    const ferMajorLandScoreTotal = this.ferMajorLandScoreRepo.create({
      soilGradeId: soilGradeTotal.soilGradeId,
      bookId: book.bookId,
      soilGradeLevelId: selectedTotalLevel.soilGradeLevelId,
      resultValue: totalScore,
      updatedUid: 1, // Mocked updatedUid, should be replaced with actual user ID
    })

    const savedFerMajorLandScore = await this.ferMajorLandScoreRepo.save(ferMajorLandScoreTotal);

    const usageType = await this.usageTypeRepo.find();
    // สร้าง FertilizerMajorLandUsage สำหรับแต่ละ ServiceFertilizerMajorUsage
    for (const servCat of serviceCategories) {
      for (const type of usageType) {
        const serviceFerMajorUsage = serviceFertilizerMajorUsages.find(
          usage => usage.serviceCategoryId === servCat.serviceCategoryId
            && usage.usageTypeId === type.usageTypeId
            && usage.soilGradeLevelId === selectedTotalLevel.soilGradeLevelId
        );
        if (serviceFerMajorUsage) {
          const ferMajorLandUsage = this.ferMajorLandUsageRepo.create({
            serviceFertilizerMajorUsageId: serviceFerMajorUsage.serviceFertilizerMajorUsageId,
            bookId: book.bookId,
            // totalScoreId: soilGradeTotal.soilGradeId,
            totalScoreId: savedFerMajorLandScore.fertilizerMajorLandScoreId, // ทำตอนเมา มาเช็คความเชื่อมโยงทีหลังด้วย
            fertilizerMajorId: serviceFerMajorUsage.fertilizerMajorId,
            grade: selectedTotalLevel.score,
            gradeText: selectedTotalLevel.scoreName,
            formula: serviceFerMajorUsage.fertilizerMajor.formular,
            useRate: serviceFerMajorUsage.volume * serviceFerMajorUsage.fertilizerMajor.quantity,
            costPerRai: ((serviceFerMajorUsage.volume * serviceFerMajorUsage.fertilizerMajor.quantity) / serviceFerMajorUsage.fertilizerMajor.quantity) * serviceFerMajorUsage.fertilizerMajor.price,
          });
          await this.ferMajorLandUsageRepo.save(ferMajorLandUsage);
        }

      }
    }


  }

  getLogs() {
    return this.ferMajorLandUsageLog.find();
  }
}
