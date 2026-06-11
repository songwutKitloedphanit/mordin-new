import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceFertilizerMinor } from 'src/fertilizer/service-fertilizer-minors/entities/service-fertilizer-minor.entity';
import { EntityManager, In, Repository } from 'typeorm';

import { Book } from '../books/entities/book.entity';
import { Result } from '../results/entities/result.entity';

import { FertilizerMinorLandUsage } from './entities/fertilizer-minor-land-usage.entity';
import { FertilizerMinorLandUsageLog } from './entities/fertilizer-minor-land-usage.log.entity';

@Injectable()
export class FertilizerMinorLandUsagesService {
  constructor(
    @InjectRepository(FertilizerMinorLandUsage)
    private readonly ferMinorLandUsageRepo: Repository<FertilizerMinorLandUsage>,

    @InjectRepository(FertilizerMinorLandUsageLog)
    private readonly ferMinorLandUsageLog: Repository<FertilizerMinorLandUsageLog>,

    @InjectRepository(ServiceFertilizerMinor)
    private readonly serviceFerMinorRepo: Repository<ServiceFertilizerMinor>,

    @InjectRepository(Result)
    private readonly resultRepo: Repository<Result>
  ) {}

  /**
   * [NEW] Bulk processing version of the summary method.
   */
  async summaryFertilizerMinorLandUsagesBulk(
    booksToSummarize: { book: Book; results: Result[] }[],
    manager: EntityManager
  ) {
    const bookIds = booksToSummarize.map(item => item.book.bookId);
    if (bookIds.length === 0) return;

    // Repositories from transaction
    const ferMinorLandUsageRepo = manager.getRepository(
      FertilizerMinorLandUsage
    );
    const serviceFerMinorRepo = manager.getRepository(ServiceFertilizerMinor);

    // STEP 1: Bulk delete existing data
    await ferMinorLandUsageRepo.delete({ bookId: In(bookIds) });

    // STEP 2: Pre-fetch all necessary service fertilizer minors
    const serviceTypeIds = [
      ...new Set(booksToSummarize.map(item => item.book.serviceTypeId)),
    ];
    const allServFerMinors = await serviceFerMinorRepo.find({
      where: { serviceTypeId: In(serviceTypeIds) },
      relations: {
        fertilizerMinor: true,
        serviceFertilizerMinorUsages: true,
      },
      order: {
        serviceFertilizerMinorUsages: { level: 'ASC' },
      },
    });

    // Create a map for quick access
    const servFerMinorsMap = new Map<number, ServiceFertilizerMinor[]>();
    for (const sfm of allServFerMinors) {
      if (!servFerMinorsMap.has(sfm.serviceTypeId)) {
        servFerMinorsMap.set(sfm.serviceTypeId, []);
      }
      servFerMinorsMap.get(sfm.serviceTypeId)!.push(sfm);
    }

    // STEP 3: Process in memory and collect all new entities to be saved
    const newLandUsages: FertilizerMinorLandUsage[] = [];

    for (const { book, results } of booksToSummarize) {
      const servFerMinors = servFerMinorsMap.get(book.serviceTypeId) ?? [];

      for (const servFerMinor of servFerMinors) {
        const refResult = results.find(
          result => result.laboratoryId === servFerMinor.laboratoryId
        );
        if (refResult) {
          const selectedUsage =
            servFerMinor.serviceFertilizerMinorUsages.find(
              ferUsage => refResult.postValue <= ferUsage.cutoffValue
            ) ||
            servFerMinor.serviceFertilizerMinorUsages[
              servFerMinor.serviceFertilizerMinorUsages.length - 1
            ];

          if (selectedUsage) {
            const ferMinorLandUsage = ferMinorLandUsageRepo.create({
              serviceFertilizerMinorId: servFerMinor.serviceFertilizerMinorId,
              bookId: book.bookId,
              resultId: refResult.resultId,
              level: selectedUsage.level,
              fertilizerMinorId: servFerMinor.fertilizerMinor.fertilizerMinorId,
              resultValue: refResult.postValue,
              fertilizerMinorName: servFerMinor.fertilizerMinor.name,
              useRatePerRai: selectedUsage.fertilizerUsageValue,
              totalUsage: selectedUsage.fertilizerUsageValue * book.areaSize,
              pricePerRai:
                servFerMinor.fertilizerMinor.pricePerUnit *
                selectedUsage.fertilizerUsageValue,
              totalPrice:
                servFerMinor.fertilizerMinor.pricePerUnit *
                selectedUsage.fertilizerUsageValue *
                book.areaSize,
              updatedUid: 1,
            });
            newLandUsages.push(ferMinorLandUsage);
          }
        }
      }
    }

    // STEP 4: Bulk save all new entities in a single query
    if (newLandUsages.length > 0) {
      await ferMinorLandUsageRepo.save(newLandUsages, { chunk: 100 }); // Use chunking for very large arrays
    }
  }

  async summaryFertilizerMinorLandUsages(book: Book, results: Result[]) {
    await this.ferMinorLandUsageRepo.delete({
      bookId: book.bookId,
    });
    const servFerMinors = await this.serviceFerMinorRepo.find({
      where: {
        serviceTypeId: book.serviceTypeId,
      },
      relations: {
        fertilizerMinor: true,
        serviceFertilizerMinorUsages: true,
      },
      order: {
        serviceFertilizerMinorUsages: {
          level: 'ASC',
        },
      },
    });

    // Calculate Usage Summary
    for (const servFerMinor of servFerMinors) {
      const refResult = results.find(
        result => result.laboratoryId === servFerMinor.laboratoryId
      );
      if (refResult) {
        // หาการใช้ปุ๋ยที่ตรงกับผลลัพธ์
        const matchedUsage = servFerMinor.serviceFertilizerMinorUsages.find(
          ferUsage => refResult.postValue <= ferUsage.cutoffValue
        );

        // หากค่ามากกว่าทุก cutoffValue ให้ใช้ค่า cutoffValue สุดท้าย
        const selectedUsage =
          matchedUsage ||
          servFerMinor.serviceFertilizerMinorUsages[
            servFerMinor.serviceFertilizerMinorUsages.length - 1
          ];
        const ferMinorLandUsage = this.ferMinorLandUsageRepo.create({
          serviceFertilizerMinorId: servFerMinor.serviceFertilizerMinorId,
          bookId: book.bookId,
          resultId: refResult.resultId,
          level: selectedUsage.level,
          fertilizerMinorId: servFerMinor.fertilizerMinor.fertilizerMinorId,
          resultValue: refResult.postValue,
          fertilizerMinorName: servFerMinor.fertilizerMinor.name,
          useRatePerRai: selectedUsage.fertilizerUsageValue,
          totalUsage: selectedUsage.fertilizerUsageValue * book.areaSize,
          pricePerRai:
            servFerMinor.fertilizerMinor.pricePerUnit *
            selectedUsage.fertilizerUsageValue,
          totalPrice:
            servFerMinor.fertilizerMinor.pricePerUnit *
            selectedUsage.fertilizerUsageValue *
            book.areaSize,
          updatedUid: 1, // Mocked updatedUid, should be replaced with actual user ID
        });
        await this.ferMinorLandUsageRepo.save(ferMinorLandUsage);
      }
    }
  }

  getLogs() {
    return this.ferMinorLandUsageLog.find();
  }
}
