import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { Unit } from './entities/unit.entity';
import { UnitLog } from './entities/unit.log.entity';

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,

    @InjectRepository(UnitLog)
    private unitLog: Repository<UnitLog>
  ) {}

  create(createUnitDto: CreateUnitDto, Uid: number) {
    const unit = this.unitRepository.create({
      ...createUnitDto,
      updateUid: Uid,
    });
    return this.unitRepository.save(unit);
  }

  findAll() {
    return this.unitRepository.find();
  }

  findOne(id: number) {
    return this.unitRepository.findOneBy({ unitId: id });
  }

  async update(id: number, updateUnitDto: UpdateUnitDto, Uid: number) {
    const unit = await this.unitRepository.findOneBy({ unitId: id });
    if (!unit) {
      throw new NotFoundException('Unit not found');
    }
    Object.assign(unit, updateUnitDto, { updateUid: Uid });
    return this.unitRepository.save(unit);
  }

  async remove(id: number): Promise<void> {
    const userId = 99;

    const unit = await this.unitRepository.findOneBy({ unitId: id });

    if (!unit) {
      throw new NotFoundException('Unit not found');
    }

    (unit as any).removedBy = userId;

    await this.unitRepository.remove(unit);
  }

  getLogs() {
    return this.unitLog.find();
  }
}
