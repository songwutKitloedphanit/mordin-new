/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateServiceCategoryDto } from './dto/create-service-category.dto';
import { UpdateServiceCategoryDto } from './dto/update-service-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceCategory } from './entities/service-category.entity';
import { Repository } from 'typeorm';
import { ServiceFertilizerMajorUsage } from 'src/fertilizer/service-fertilizer-major-usages/entities/service-fertilizer-major-usage.entity';
import { ServiceFertilizerMajorUsagesService } from 'src/fertilizer/service-fertilizer-major-usages/service-fertilizer-major-usages.service';
import { ServiceCategoryLog } from './entities/service-category.log.entity';

@Injectable()
export class ServiceCategoriesService {
  constructor(
    @InjectRepository(ServiceCategory)
    private readonly serviceCategoryRepository: Repository<ServiceCategory>,

    @InjectRepository(ServiceFertilizerMajorUsage)
    private readonly servFerMajorUsageRepo: Repository<ServiceFertilizerMajorUsage>,

    private readonly servFerMajorUsageService: ServiceFertilizerMajorUsagesService,
    @InjectRepository(ServiceCategoryLog)
    private readonly serviceCategoryLog: Repository<ServiceCategoryLog>,
  ) {}

  create(createServiceCategoryDto: CreateServiceCategoryDto,Uid: number) {
    const mockUpdateUid = 1;
    const serviceCategory = this.serviceCategoryRepository.create({
      ...createServiceCategoryDto,
      // updateUid: mockUpdateUid,
    });

    return this.serviceCategoryRepository.save(serviceCategory);
  }

  findAll() {
    return (
      this.serviceCategoryRepository
        .createQueryBuilder('serviceCategory')
        // .leftJoinAndSelect('serviceCategory.updateUser', 'updateUser')
        // .leftJoinAndSelect('serviceCategory.serviceType', 'serviceType')
        .getMany()
    );
  }

  findOne(id: number) {
    return this.serviceCategoryRepository.findOne({
      where: { serviceCategoryId: id },
      relations: {
        serviceType: true,
        serviceFertilizerMajorUsages: {
          fertilizerMajor: true,
          soilGradeLevel: true,
          usageType: true,
        },
      },
    });
  }

  async update(id: number, updateServiceCategoryDto: UpdateServiceCategoryDto,Uid : number) {
    const mockUpdateUid = 1;
    const serviceCategory = await this.serviceCategoryRepository.findOneBy({
      serviceCategoryId: id,
    });
    if (!serviceCategory) {
      throw new NotFoundException('Service Category not found');
    }
    // Object.assign(serviceCategory, updateServiceCategoryDto, {
    //   // updateUid: mockUpdateUid,
    // });

    return this.serviceCategoryRepository.save(serviceCategory);
  }

  async remove(id: number): Promise<void> {
    const userId = 99; // mock
    // 1. ค้นหา Entity ที่ต้องการลบ
    const serviceCategory = await this.serviceCategoryRepository.findOneBy({ serviceCategoryId: id });
    if (!serviceCategory) {
      throw new NotFoundException('serviceCategory not found');
    }

    // 2. แนบ userId เข้าไปใน property ที่เรานิยามไว้ใน .d.ts
    serviceCategory.removedBy = userId;

    // 3. ส่ง Entity object ที่แก้ไขแล้วไปให้ .remove()
    await this.serviceCategoryRepository.remove(serviceCategory);
  }

  getLogs() {
    return this.serviceCategoryLog.find();
  }
}
