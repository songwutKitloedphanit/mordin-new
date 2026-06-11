import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateLaboratorySettingDetailDto } from './dto/create-laboratory-setting-detail.dto';
import { UpdateLaboratorySettingDetailDto } from './dto/update-laboratory-setting-detail.dto';
import { LaboratorySettingDetailLog } from './entities/laboratory-setting-detail.log.entity';

@Injectable()
export class LaboratorySettingDetailsService {
  constructor(
    @InjectRepository(LaboratorySettingDetailLog)
    private laboratorySettingDetailLog: Repository<LaboratorySettingDetailLog>
  ) {}

  create(
    createLaboratorySettingDetailDto: CreateLaboratorySettingDetailDto,
    Uid: number
  ) {
    return 'This action adds a new laboratorySettingDetail';
  }

  findAll() {
    return `This action returns all laboratorySettingDetails`;
  }

  findOne(id: number) {
    return `This action returns a #${id} laboratorySettingDetail`;
  }

  update(
    id: number,
    updateLaboratorySettingDetailDto: UpdateLaboratorySettingDetailDto,
    Uid: number
  ) {
    return `This action updates a #${id} laboratorySettingDetail`;
  }

  remove(id: number) {
    return `This action removes a #${id} laboratorySettingDetail`;
  }

  getLogs() {
    return this.laboratorySettingDetailLog.find();
  }
}
