import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateUsageTypeDto } from './dto/create-usage-type.dto';
import { UpdateUsageTypeDto } from './dto/update-usage-type.dto';
import { UsageType } from './entities/usage-type.entity';
import { UsageTypeLog } from './entities/usage-type.log.entity';

@Injectable()
export class UsageTypesService {
  constructor(
    @InjectRepository(UsageType)
    private readonly usageTypeRepository: Repository<UsageType>,

    @InjectRepository(UsageTypeLog)
    private readonly usageTypeLog: Repository<UsageTypeLog>
  ) {}

  create(createUsageTypeDto: CreateUsageTypeDto, Uid: number) {
    const usageType = this.usageTypeRepository.create({
      ...createUsageTypeDto,
      updateUid: Uid,
    });
    return this.usageTypeRepository.save(usageType);
  }

  findAll() {
    return this.usageTypeRepository.find({
      relations: ['updateUser'],
    });
  }

  findOne(id: number) {
    return this.usageTypeRepository.findOne({
      where: { usageTypeId: id },
      relations: ['updateUser'],
    });
  }

  async update(
    id: number,
    updateUsageTypeDto: UpdateUsageTypeDto,
    Uid: number
  ) {
    const usageType = await this.usageTypeRepository.findOneBy({
      usageTypeId: id,
    });
    if (!usageType) {
      throw new NotFoundException('UsageType not found');
    }
    Object.assign(usageType, updateUsageTypeDto, { updateUid: Uid });
    return this.usageTypeRepository.save(usageType);
  }

  async remove(id: number) {
    const userId = 99; // mockUid ...

    const usageType = await this.usageTypeRepository.findOneBy({
      usageTypeId: id,
    });

    if (!usageType) {
      throw new NotFoundException('UsageType not found');
    }

    (usageType as any).removedBy = userId;

    await this.usageTypeRepository.remove(usageType);
  }

  getLogs() {
    return this.usageTypeLog.find();
  }
}
