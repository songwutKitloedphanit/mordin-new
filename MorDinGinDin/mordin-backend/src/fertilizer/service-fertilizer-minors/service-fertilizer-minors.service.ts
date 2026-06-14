import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateServiceFertilizerMinorDto } from './dto/create-service-fertilizer-minor.dto';
import { UpdateServiceFertilizerMinorDto } from './dto/update-service-fertilizer-minor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceFertilizerMinor } from './entities/service-fertilizer-minor.entity';
import { ServiceFertilizerMinorUsage } from '../service-fertilizer-minor-usages/entities/service-fertilizer-minor-usage.entity';
import { Repository } from 'typeorm';
import { FertilizerMinorsService } from '../fertilizer-minors/fertilizer-minors.service';
import { ServiceFertilizerMinorLog } from './entities/service-fertilizer-minor.log.entity';

@Injectable()
export class ServiceFertilizerMinorsService {
  constructor(
    @InjectRepository(ServiceFertilizerMinor)
    private readonly servFerMinorRepo: Repository<ServiceFertilizerMinor>,

    @InjectRepository(ServiceFertilizerMinorUsage)
    private readonly servFerMinorUsageRepo: Repository<ServiceFertilizerMinorUsage>,

    @InjectRepository(ServiceFertilizerMinorLog)
    private readonly servFerMinorLog: Repository<ServiceFertilizerMinorLog>,

    private readonly fertilizerMinorsService: FertilizerMinorsService,
  ) { }

  async create(
    createServiceFertilizerMinorDto: CreateServiceFertilizerMinorDto,
    Uid: number
  ) {
    const { serviceFertilizerMinorUsages, ...minorData } =
      createServiceFertilizerMinorDto;
    // Create the ServiceFertilizerMinor entity
    const serviceFertilizerMinor = this.servFerMinorRepo.create({
      ...minorData,
      updateUid: Uid,
    });
    const savedServiceFertilizerMinor = await this.servFerMinorRepo.save(
      serviceFertilizerMinor,
    );

    // Create the ServiceFertilizerMinorUsage entities
    const usageEntities = serviceFertilizerMinorUsages.map((usageDto) => {
      return this.servFerMinorUsageRepo.create({
        ...usageDto,
        serviceFertilizerMinor: savedServiceFertilizerMinor,
        updateUid: Uid,
      });
    });

    await this.servFerMinorUsageRepo.save(usageEntities);

    return savedServiceFertilizerMinor;
  }

  async findAll() {
    return await this.servFerMinorRepo.find({
      relations: [
        'updateUser',
        'fertilizerMinor',
        'serviceType',
        'laboratory',
        'serviceFertilizerMinorUsages',
      ],
    });
  }

  findOne(id: number) {
    return this.servFerMinorRepo.findOne({
      where: { serviceFertilizerMinorId: id },
      relations: {
        updateUser: true,
        fertilizerMinor: true,
        serviceType: true,
        laboratory: true,
        serviceFertilizerMinorUsages: true,
      },
    });
  }

  async update(id: number, updateServiceFertilizerMinorDto: UpdateServiceFertilizerMinorDto, Uid: number) {
    const { serviceFertilizerMinorUsages, ...minorData } = updateServiceFertilizerMinorDto;

    // Update the ServiceFertilizerMinor entity
    const serviceFertilizerMinor = await this.servFerMinorRepo.findOne({
      where: { serviceFertilizerMinorId: id },
    });
    if (!serviceFertilizerMinor) {
      throw new NotFoundException(`ServiceFertilizerMinor with ID ${id} not found`);
    }
    const updateServiceFertilizerMinor = {
      ...serviceFertilizerMinor,
      ...minorData,
      updateUid: Uid,
    }
    const updatedServiceFertilizerMinor = await this.servFerMinorRepo.save(
      updateServiceFertilizerMinor,
    );
    const usagesToRemove = await this.servFerMinorUsageRepo.find({
      where: {
        serviceFertilizerMinor: { serviceFertilizerMinorId: id },
      },
    });

    if (usagesToRemove.length > 0) {
      const userId = Uid;
      for (const usage of usagesToRemove) {
        (usage as any).removedBy = userId;
      }
      await this.servFerMinorUsageRepo.remove(usagesToRemove);
    }

    // Create and save new ServiceFertilizerMinorUsage entities
    if (!serviceFertilizerMinorUsages || serviceFertilizerMinorUsages.length === 0) {
      return updatedServiceFertilizerMinor;
    }
    const usageEntities = serviceFertilizerMinorUsages.map((usageDto) => {
      return this.servFerMinorUsageRepo.create({
        ...usageDto,
        serviceFertilizerMinorId: updatedServiceFertilizerMinor.serviceFertilizerMinorId,
        updateUid: Uid,
      });
    });

    await this.servFerMinorUsageRepo.save(usageEntities);
    const final = this.servFerMinorRepo.findOne({
      where: { serviceFertilizerMinorId: id },
      relations: {
        updateUser: true,
        fertilizerMinor: true,
        serviceType: true,
        laboratory: true,
        serviceFertilizerMinorUsages: true,
      },
    });

    return final;
  }

  async remove(id: number) {
    //didnt change logic ...
    const userId = 99; // mockUid ...

    const serviceFertilizerMinor = await this.servFerMinorRepo.findOne({
      where: { serviceFertilizerMinorId: id },
    });

    if (!serviceFertilizerMinor) {
      throw new Error(`ServiceFertilizerMinor with ID ${id} not found`);
    }

    // Remove associated ServiceFertilizerMinorUsage entities
    await this.servFerMinorUsageRepo.delete({
      serviceFertilizerMinor: { serviceFertilizerMinorId: id },
    });

    serviceFertilizerMinor.removedBy = userId;

    // Remove the ServiceFertilizerMinor entity
    await this.servFerMinorRepo.delete(id);

    return { message: `ServiceFertilizerMinor with ID ${id} has been removed` };
  }

  async createAllServiceFromServiceTypeId(
    serviceTypeId: number,
    update_uid: number,
  ) {
    const ferMinors = await this.fertilizerMinorsService.findAll();
    for (const fer of ferMinors) {
      const serviceFertilizerMinor = this.servFerMinorRepo.create({
        fertilizerMinorId: fer.fertilizerMinorId,
        serviceType: { serviceTypeId: serviceTypeId },
        updateUid: update_uid,
        unitId: fer.unitId,
      });
      this.servFerMinorRepo.save(serviceFertilizerMinor);
    }
  }

  getLogs() {
    return this.servFerMinorLog.find();
  }
}
