import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ResultGradeLevel } from '../result-grade-levels/entities/result-grade-level.entity';

import { CreateResultGradeDto } from './dto/create-result-grade.dto';
import { UpdateResultGradeDto } from './dto/update-result-grade.dto';
import { ResultGrade } from './entities/result-grade.entity';
import { ResultGradeLog } from './entities/result-grade.log.entity';

@Injectable()
export class ResultGradesService {
  constructor(
    @InjectRepository(ResultGrade)
    private readonly resultGradesRepository: Repository<ResultGrade>,

    @InjectRepository(ResultGradeLevel)
    private readonly resultGradeLevelRepository: Repository<ResultGradeLevel>,

    @InjectRepository(ResultGradeLog)
    private readonly resultGradeLog: Repository<ResultGradeLog>
  ) {}

  async createForServiceType(
    serviceTypeId: number,
    labId: number,
    updatedUid: number
  ) {
    const resultGrade = this.resultGradesRepository.create({
      serviceTypeId,
      laboratoryId: labId,
      updatedUid,
    });
    return await this.resultGradesRepository.save(resultGrade);
  }

  create(createResultGradeDto: CreateResultGradeDto, Uid: number) {
    return 'This action adds a new resultGrade';
  }

  findAll() {
    const resultGrade = this.resultGradesRepository.find({
      relations: {
        serviceType: true,
        laboratory: true,
        resultGradeLevels: true,
      },
    });
    return resultGrade;
  }

  findOne(id: number) {
    const resultGrade = this.resultGradesRepository.findOne({
      where: { resultGradeId: id },
      relations: {
        serviceType: true,
        laboratory: true,
        resultGradeLevels: true,
      },
    });
    return resultGrade;
  }

  async update(
    id: number,
    updateResultGradeDto: UpdateResultGradeDto,
    Uid: number
  ) {
    // ตรวจสอบว่ามี resultGrade หรือไม่
    const resultGrade = await this.resultGradesRepository.findOneBy({
      resultGradeId: id,
    });

    if (!resultGrade) {
      throw new NotFoundException('Result grade not found');
    }

    // ลบ resultGradeLevel ที่มี resultGradeId ตรงกับ id นี้ก่อน
    const levelsToRemove = await this.resultGradeLevelRepository.find({
      where: { resultGradeId: id },
    });

    // 2. ถ้ามีข้อมูลเก่า, ให้ลบด้วย .remove()
    if (levelsToRemove.length > 0) {
      // (Optional) แนบ userId เพื่อให้ Subscriber รู้ว่าใครเป็นคนลบ
      for (const level of levelsToRemove) {
        (level as any).removedBy = Uid;
      }
      await this.resultGradeLevelRepository.remove(levelsToRemove);
    }

    // เตรียมข้อมูลใหม่เพื่อ save
    const resultGradeLevels = updateResultGradeDto.resultGradeLevels.map(
      level => ({
        ...level,
        resultGrade: { resultGradeId: id },
      })
    );

    // save ข้อมูลใหม่
    return await this.resultGradeLevelRepository.save(resultGradeLevels);
  }

  remove(id: number) {
    return `This action removes a #${id} resultGrade`;
  }

  getLogs() {
    return this.resultGradeLog.find();
  }
}
