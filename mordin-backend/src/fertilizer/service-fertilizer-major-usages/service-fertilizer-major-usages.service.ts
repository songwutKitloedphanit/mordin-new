/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateServiceFertilizerMajorUsageDto } from './dto/create-service-fertilizer-major-usage.dto';
import { UpdateServiceFertilizerMajorUsageDto } from './dto/update-service-fertilizer-major-usage.dto';
import { ServiceFertilizerMajorUsage } from './entities/service-fertilizer-major-usage.entity';
import { ServiceFertilizerMajorUsageLog } from './entities/service-fertilizer-major-usage.log.entity';

@Injectable()
export class ServiceFertilizerMajorUsagesService {
  constructor(
    @InjectRepository(ServiceFertilizerMajorUsage)
    private readonly servFerMajorUsageRepo: Repository<ServiceFertilizerMajorUsage>,

    @InjectRepository(ServiceFertilizerMajorUsageLog)
    private readonly servFerMajorUsageLog: Repository<ServiceFertilizerMajorUsageLog>,
  ) {}

exists(serviceCategoryId: number, usageTypeId: number, arg2: number) {
    throw new Error('Method not implemented.');
  }


  create(
    createServiceFertilizerMajorUsageDto: CreateServiceFertilizerMajorUsageDto,
    Uid: number
  ) {
    const serviceFertilizerMajorUsage = this.servFerMajorUsageRepo.create({
      ...createServiceFertilizerMajorUsageDto,
      updateUid: Uid,
    });
    return this.servFerMajorUsageRepo.save(serviceFertilizerMajorUsage);
  }

  findAll() {
    return this.servFerMajorUsageRepo.find({
      relations: {
        updateUser: true,
        fertilizerMajor: true,
        serviceCategory: true,
        usageType: true,
        soilGradeLevel: true,
      },
    });
  }

  findOne(id: number) {
    return this.servFerMajorUsageRepo.findOne({
      where: { serviceFertilizerMajorUsageId: id },
      relations: {
        updateUser: true,
        fertilizerMajor: true,
        serviceCategory: true,
        usageType: true,
        soilGradeLevel: true,
      },
    });
  }

  async update(updateDatas: UpdateServiceFertilizerMajorUsageDto[], Uid: number) {
    const updatedServiceFertilizerMajorUsages: ServiceFertilizerMajorUsage[] =
      [];
    for (const updateData of updateDatas) {
      const serviceFertilizerMajorUsage =
        await this.servFerMajorUsageRepo.findOneBy({
          serviceFertilizerMajorUsageId:
            updateData.serviceFertilizerMajorUsageId,
        });
      if (!serviceFertilizerMajorUsage) {
        throw new NotFoundException(
          `Service Fertilizer Major Usage with ID ${updateData.serviceFertilizerMajorUsageId} not found`,
        );
      }
      const update = {
        ...serviceFertilizerMajorUsage,
        ...updateData,
        updateUid: Uid,
      };
      const temp = await this.servFerMajorUsageRepo.save(update);
      updatedServiceFertilizerMajorUsages.push(temp);
    }
    return updatedServiceFertilizerMajorUsages;
  }

  async remove(id: number) {
    const userId = 99; // mockUid ...
    const serviceFertilizerMajorUsage =
      await this.servFerMajorUsageRepo.findOneBy({
        serviceFertilizerMajorUsageId: id,
      });
    if (!serviceFertilizerMajorUsage) {
      throw new NotFoundException('ServiceFertilizerMajorUsage not found');
    }

    (serviceFertilizerMajorUsage as any).removedBy = userId;

    await this.servFerMajorUsageRepo.remove(serviceFertilizerMajorUsage);
  }

  async createByServiceCategories(
    serviceCategoryId: number,
    usageTypeId: number,
    soilGradeLevelId: number,
    updateUid: number,
  ) {
    const serviceFertilizerMajorUsage = this.servFerMajorUsageRepo.create({
      serviceCategoryId,
      usageTypeId,
      soilGradeLevelId,
      updateUid,
    });
    return this.servFerMajorUsageRepo.save(serviceFertilizerMajorUsage);
  }

  async removeByServiceCategoryId(serviceCategoryId: number) {
    // ค้นหาทั้งหมดที่มี serviceCategoryId นี้
    const serviceFertilizerMajorUsageList =
      await this.servFerMajorUsageRepo.find({
        where: { serviceCategoryId },
      });

    console.log(serviceFertilizerMajorUsageList);

    if (serviceFertilizerMajorUsageList.length > 0) {
      // ลบทั้งหมดที่พบ
      await this.servFerMajorUsageRepo.remove(serviceFertilizerMajorUsageList);
    }

    return { deleted: serviceFertilizerMajorUsageList.length > 0 };
  }

  getLogs() {
    return this.servFerMajorUsageLog.find();
  }
}
