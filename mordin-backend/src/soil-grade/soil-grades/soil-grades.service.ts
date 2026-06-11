import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Laboratory } from 'src/laboratory/laboratories/entities/laboratory.entity';
import { SoilGradeLevel } from 'src/soil-grade/soil-grade-levels/entities/soil-grade-level.entity';
import { Repository } from 'typeorm';

import { SoilGradeLevelsService } from '../soil-grade-levels/soil-grade-levels.service';

import { CreateSoilGradeDto } from './dto/create-soil-grade.dto';
import { UpdateSoilGradeDto } from './dto/update-soil-grade.dto';
import { SoilGrade } from './entities/soil-grade.entity';
import { SoilGradeLog } from './entities/soil-grade.log.entity';

@Injectable()
export class SoilGradesService {
  constructor(
    @InjectRepository(SoilGrade)
    private soilGradesRepository: Repository<SoilGrade>,

    @InjectRepository(SoilGradeLevel)
    private soilGradeLevelsRepository: Repository<SoilGradeLevel>,
    @InjectRepository(SoilGradeLog)
    private soilGradesLog: Repository<SoilGradeLog>,
    @InjectRepository(Laboratory)
    private laboratoryRepository: Repository<Laboratory>,

    private readonly soilGradeLevelsService: SoilGradeLevelsService
  ) {}

  async create(createSoilGradeDto: CreateSoilGradeDto, Uid: number) {
    const soilGrade = this.soilGradesRepository.create({
      serviceTypeId: createSoilGradeDto.serviceTypeId,
      laboratoryId: createSoilGradeDto.laboratoryId,
      parameter: createSoilGradeDto.parameter,
      updateUid: Uid,
    });

    // Save soil grade to get the ID
    const savedSoilGrade = await this.soilGradesRepository.save(soilGrade);

    // Create soil grade levels if provided
    if (
      createSoilGradeDto.soilGradeLevels &&
      createSoilGradeDto.soilGradeLevels.length > 0
    ) {
      const soilGradeLevels = createSoilGradeDto.soilGradeLevels.map(
        levelDto => {
          return this.soilGradeLevelsRepository.create({
            ...levelDto,
            soilGradeId: savedSoilGrade.soilGradeId,
            updateUid: Uid,
          });
        }
      );

      // Save all soil grade levels
      await this.soilGradeLevelsRepository.save(soilGradeLevels);
    }

    return savedSoilGrade;
  }

  async findAll() {
    return await this.soilGradesRepository.find({
      relations: {
        soilGradeLevels: true,
        updateUser: true,
        laboratory: true,
        serviceType: true,
      },
      order: {
        soilGradeId: 'ASC',
      },
    });
  }

  async findOne(id: number) {
    const soilGrade = await this.soilGradesRepository.findOne({
      where: { soilGradeId: id },
      relations: {
        soilGradeLevels: true,
        updateUser: true,
        laboratory: true,
        serviceType: true,
      },
    });
    if (!soilGrade) {
      throw new NotFoundException(`SoilGrade with ID ${id} not found`);
    }
    return soilGrade;
  }

  async findByServiceTypeId(serviceTypeId: number) {
    const soilGrades = await this.soilGradesRepository.find({
      where: { serviceTypeId },
      relations: {
        soilGradeLevels: true,
        laboratory: true,
        serviceType: true,
      },
    });
    if (!soilGrades) {
      throw new NotFoundException(
        `SoilGrade with serviceTypeId ${serviceTypeId} not found`
      );
    }
    return soilGrades;
  }

  async update(updateSoilGradeDto: UpdateSoilGradeDto[], Uid: number) {
    for (const updateData of updateSoilGradeDto) {
      const { soilGradeId } = updateData;
      const soilGrade = await this.soilGradesRepository.findOne({
        where: { soilGradeId },
      });
      if (!soilGrade) {
        throw new NotFoundException(
          `SoilGrade with ID ${soilGradeId} not found`
        );
      }
      const updateSoilGradeData = {
        ...soilGrade,
        ...updateData,
        updateUid: Uid,
      };
      const updatedSoilGrade =
        await this.soilGradesRepository.save(updateSoilGradeData);

      // Update the soil grade levels
      if (updateData.soilGradeLevels && updateData.soilGradeLevels.length > 0) {
        for (const soilLevel of updateData.soilGradeLevels) {
          const soilGradeLevel = await this.soilGradeLevelsRepository.findOne({
            where: { soilGradeId, level: soilLevel.level },
          });
          if (!soilGradeLevel) {
            throw new NotFoundException(
              `SoilGradeLevel with level ${soilLevel.level} not found`
            );
          }
          const updateSoilGradeLevelData = {
            ...soilGradeLevel,
            ...soilLevel,
            updateUid: Uid,
          };
          await this.soilGradeLevelsRepository.save(updateSoilGradeLevelData);
        }
      }
    }

    // Fetch updated soil grade with relations
    const final = updateSoilGradeDto.map(async updateData => {
      const { soilGradeId } = updateData;
      return await this.soilGradesRepository.findOne({
        where: { soilGradeId },
        relations: {
          soilGradeLevels: true,
        },
      });
    });
    const results = await Promise.all(final);
    return results;
  }

  async remove(id: number): Promise<void> {
    const userId = 99; // mock
    // 1. ค้นหา Entity ที่ต้องการลบ
    const soil_grade = await this.soilGradesRepository.findOneBy({
      soilGradeId: id,
    });
    if (!soil_grade) {
      throw new NotFoundException('Bus not found');
    }

    // 2. แนบ userId เข้าไปใน property ที่เรานิยามไว้ใน .d.ts
    (soil_grade as any).removedBy = userId;

    // 3. ส่ง Entity object ที่แก้ไขแล้วไปให้ .remove()
    await this.soilGradesRepository.remove(soil_grade);
  }

  async createDefaultTotalForServiceType(
    serviceTypeId: number,
    updateUid: number
  ) {
    const soilGrade = this.soilGradesRepository.create({
      serviceTypeId,
      parameter: 'Total Score',
      updateUid,
    });
    return this.soilGradesRepository.save(soilGrade);
  }

  async createByServiceTypeLaboratory(
    serviceTypeId: number,
    laboratoryId: number,
    updateUid: number
  ) {
    const lab = await this.laboratoryRepository.findOne({
      where: { laboratoryId },
    });
    const soilGrade = this.soilGradesRepository.create({
      serviceTypeId,
      laboratoryId,
      parameter: `${lab?.shortNameAfter} (${lab?.unitAfter})`,
      updateUid,
    });

    const savedSoilGrade = await this.soilGradesRepository.save(soilGrade);
    await this.soilGradeLevelsService.createDefaultForSoilGradeLab(
      savedSoilGrade.soilGradeId,
      updateUid
    );

    return savedSoilGrade;
  }

  getLogs() {
    return this.soilGradesLog.find();
  }
}
