import { Injectable } from '@nestjs/common';
import { CreateResultGradeLevelDto } from './dto/create-result-grade-level.dto';
import { UpdateResultGradeLevelDto } from './dto/update-result-grade-level.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ResultGradeLevelLog } from './entities/result-grade-level.log.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ResultGradeLevelsService {
  constructor(
    @InjectRepository(ResultGradeLevelLog)
    private resultGradeLevelLog: Repository<ResultGradeLevelLog>
  ) {}
  create(createResultGradeLevelDto: CreateResultGradeLevelDto, Uid: number) {
    return 'This action adds a new resultGraadeLevel';
  }

  findAll() {
    return `This action returns all resultGradeLevels`;
  }

  findOne(id: number) {
    return `This action returns a #${id} resultGradeLevel`;
  }

  update(id: number, updateResultGradeLevelDto: UpdateResultGradeLevelDto, Uid: number) {
    return `This action updates a #${id} resultGradeLevel`;
  }

  remove(id: number) {
    return `This action removes a #${id} resultGradeLevel`;
  }

  getLogs() {
    return this.resultGradeLevelLog.find();
  }
}
