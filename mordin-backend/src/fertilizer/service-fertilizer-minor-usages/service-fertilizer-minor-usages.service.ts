import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateServiceFertilizerMinorUsageDto } from './dto/create-service-fertilizer-minor-usage.dto';
import { UpdateServiceFertilizerMinorUsageDto } from './dto/update-service-fertilizer-minor-usage.dto';
import { ServiceFertilizerMinorUsage } from './entities/service-fertilizer-minor-usage.entity';
import { ServiceFertilizerMinorUsageLog } from './entities/service-fertilizer-minor-usage.log.entity';

@Injectable()
export class ServiceFertilizerMinorUsagesService {
  constructor(
    @InjectRepository(ServiceFertilizerMinorUsage)
    private readonly serviceFertilizerMinorUsageRepository: Repository<ServiceFertilizerMinorUsage>,

    @InjectRepository(ServiceFertilizerMinorUsageLog)
    private readonly serviceFertilizerMinorUsageLog: Repository<ServiceFertilizerMinorUsageLog>
  ) {}

  create(
    createServiceFertilizerMinorUsageDto: CreateServiceFertilizerMinorUsageDto,
    Uid: number
  ) {
    return 'This action adds a new serviceFertilizerMinorUsage';
  }

  findAll() {
    return `This action returns all serviceFertilizerMinorUsages`;
  }

  findOne(id: number) {
    return `This action returns a #${id} serviceFertilizerMinorUsage`;
  }

  update(
    id: number,
    updateServiceFertilizerMinorUsageDto: UpdateServiceFertilizerMinorUsageDto,
    Uid: number
  ) {
    return `This action updates a #${id} serviceFertilizerMinorUsage`;
  }

  remove(id: number) {
    return `This action removes a #${id} serviceFertilizerMinorUsage`;
  }

  getLogs() {
    return this.serviceFertilizerMinorUsageLog.find();
  }
}
