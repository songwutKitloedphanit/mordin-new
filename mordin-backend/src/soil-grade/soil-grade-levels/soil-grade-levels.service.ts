import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateSoilGradeLevelDto } from './dto/create-soil-grade-level.dto';
import { UpdateSoilGradeLevelDto } from './dto/update-soil-grade-level.dto';
import { SoilGradeLevel } from './entities/soil-grade-level.entity';
import { SoilGradeLevelLog } from './entities/soil-grade-level.log.entity';

@Injectable()
export class SoilGradeLevelsService {
  constructor(
    @InjectRepository(SoilGradeLevel)
    private readonly soilGradeLevelRepo: Repository<SoilGradeLevel>,
    @InjectRepository(SoilGradeLevelLog)
    private readonly soilGradeLevelLog: Repository<SoilGradeLevelLog>
  ) {}

  create(createSoilGradeLevelDto: CreateSoilGradeLevelDto, Uid: number) {
    return 'This action adds a new soilGradeLevel';
  }

  findAll() {
    return `This action returns all soilGradeLevels`;
  }

  findOne(id: number) {
    return `This action returns a #${id} soilGradeLevel`;
  }

  update(
    id: number,
    updateSoilGradeLevelDto: UpdateSoilGradeLevelDto,
    Uid: number
  ) {
    return `This action updates a #${id} soilGradeLevel`;
  }

  async remove(id: number): Promise<void> {
    const userId = 99; // mock
    // 1. ค้นหา Entity ที่ต้องการลบ
    const soil_grade_level = await this.soilGradeLevelRepo.findOneBy({
      soilGradeId: id,
    });
    if (!soil_grade_level) {
      throw new NotFoundException('soil_grade_level not found');
    }

    // 2. แนบ userId เข้าไปใน property ที่เรานิยามไว้ใน .d.ts
    (soil_grade_level as any).removedBy = userId;

    // 3. ส่ง Entity object ที่แก้ไขแล้วไปให้ .remove()
    await this.soilGradeLevelRepo.remove(soil_grade_level);
  }

  async createDefaultForSoilGradeLab(soilGradeId: number, updateUid: number) {
    const levelMappings = [
      { level: 1, score: 1, cutoffText: 'ต่ำ' },
      { level: 2, score: 2, cutoffText: 'ปานกลาง' },
      { level: 3, score: 3, cutoffText: 'สูง' },
    ];
    for (const { level, score, cutoffText } of levelMappings) {
      const soilGradeLevel = this.soilGradeLevelRepo.create({
        soilGradeId,
        level,
        score,
        scoreName: cutoffText,
        cutoffValue: 0,
        cutoffText: '',
        updateUid,
      });
      await this.soilGradeLevelRepo.save(soilGradeLevel);
    }
  }

  async createDefaultForSoilGradeTotalScore(
    soilGradeId: number,
    updateUid: number
  ) {
    const levelMappings = [
      { level: 1, score: 1, cutoffText: 'ต่ำ' },
      { level: 2, score: 2, cutoffText: 'ปานกลาง' },
      { level: 3, score: 3, cutoffText: 'สูง' },
    ];
    for (const { level, score, cutoffText } of levelMappings) {
      const soilGradeLevel = this.soilGradeLevelRepo.create({
        soilGradeId,
        level,
        score,
        scoreName: cutoffText,
        cutoffValue: 0,
        cutoffText: '',
        updateUid,
      });
      await this.soilGradeLevelRepo.save(soilGradeLevel);
    }
    return this.soilGradeLevelRepo.find({
      where: { soilGradeId },
      order: { level: 'ASC' },
    });
  }

  getLogs() {
    return this.soilGradeLevelRepo.find();
  }
}
