import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateMachineTypeDto } from './dto/create-machine-type.dto';
import { UpdateMachineTypeDto } from './dto/update-machine-type.dto';
import { MachineType } from './entities/machine-type.entity';
import { MachineTypeLog } from './entities/machine-type.log.entity';

@Injectable()
export class MachineTypesService {
  constructor(
    @InjectRepository(MachineType)
    private readonly machineTypeRepository: Repository<MachineType>,

    @InjectRepository(MachineTypeLog)
    private matchineTypeLog: Repository<MachineTypeLog>
  ) {}

  create(createMachineTypeDto: CreateMachineTypeDto, Uid: number) {
    const machineType = this.machineTypeRepository.create({
      ...createMachineTypeDto,
      updateUid: Uid,
    });
    return this.machineTypeRepository.save(machineType);
  }

  findAll() {
    return this.machineTypeRepository.find();
  }

  findOne(id: number) {
    return this.machineTypeRepository.findOneBy({
      machineTypeId: id,
    });
  }

  async update(
    id: number,
    updateMachineTypeDto: UpdateMachineTypeDto,
    Uid: number
  ) {
    const machineType = await this.machineTypeRepository.findOneBy({
      machineTypeId: id,
    });
    if (!machineType) {
      throw new NotFoundException('Machine Type not found');
    }
    Object.assign(machineType, updateMachineTypeDto, {
      updateUid: Uid,
    });
    return this.machineTypeRepository.save(machineType);
  }

  async remove(id: number): Promise<void> {
    const userId = 99;

    const machineType = await this.machineTypeRepository.findOneBy({
      machineTypeId: id,
    });

    if (!machineType) {
      throw new NotFoundException('Machine type not found');
    }

    (machineType as any).removedBy = userId;

    await this.machineTypeRepository.remove(machineType);
  }

  getLogs() {
    return this.matchineTypeLog.find();
  }
}
