import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { CreateFactoryDto } from './dto/create-factory.dto';
import { UpdateFactoryDto } from './dto/update-factory.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Factory } from './entities/factory.entity';
import { Repository } from 'typeorm';
import { ServiceArea } from '../service-areas/entities/service-area.entity';
import { FactorySummaryDTO } from './dto/factory-summary.dto';
import { FactoryLog } from './entities/factory.log.entity';

@Injectable()
export class FactoriesService {
  constructor(
    @InjectRepository(Factory)
    private factoryRepo: Repository<Factory>,

    @InjectRepository(ServiceArea)
    private serviceAreaRepo: Repository<ServiceArea>,
    @InjectRepository(FactoryLog)
    private factoryLog: Repository<FactoryLog>,
  ) { }

  async create(createFactoryDto: CreateFactoryDto, Uid: number) {
    // Create the factory entity
    const factory = this.factoryRepo.create({
      ...createFactoryDto,
      updateUid: Uid,
    });

    // Save the factory entity
    const savedFactory = await this.factoryRepo.save(factory);

    // Create and save related service areas
    if (
      createFactoryDto.serviceAreas &&
      createFactoryDto.serviceAreas.length > 0
    ) {
      const serviceAreas = createFactoryDto.serviceAreas.map((serviceAreaDto) =>
        this.serviceAreaRepo.create({
          ...serviceAreaDto,
          factoryId: savedFactory.factoryId,
          updateUid: Uid,
        }),
      );

      await this.serviceAreaRepo.save(serviceAreas);
    }
    return savedFactory;
  }

  async update(id: number, updateFactoryDto: UpdateFactoryDto, Uid: number) {

    // Find the existing factory without loading serviceAreas
    const factory = await this.factoryRepo.findOne({
      where: { factoryId: id },
    });
    if (!factory) {
      throw new BadRequestException(`Factory with ID ${id} not found`);
    }

    const { name, initial, note } = updateFactoryDto;

    // Update the factory entity
    const { serviceAreas, ...factoryData } = updateFactoryDto; // แยก serviceAreas ออก
    await this.factoryRepo.update(id, {
      name,
      initial,
      note,
      updateUid: Uid,
    });

    // Fetch updated factory
    const updatedFactory = await this.factoryRepo.findOne({
      where: { factoryId: id },
    });
    if (!updatedFactory) {
      throw new BadRequestException(
        `Factory with ID ${id} not found after update`,
      );
    }

    // Update Existing Service Areas
    if (serviceAreas && serviceAreas.length > 0) {
      for (const serviceAreaDto of serviceAreas) {
        const existingServiceArea = await this.serviceAreaRepo.findOne({
          where: { serviceAreaId: serviceAreaDto.serviceAreaId },
        });
        if (existingServiceArea) {
          // Update existing service area
          Object.assign(existingServiceArea, {
            ...serviceAreaDto,
            factoryId: updatedFactory.factoryId,
            updateUid: Uid,
          });
          await this.serviceAreaRepo.save(existingServiceArea);
        }
      }
    }

    // Create New Service Areas
    if (
      updateFactoryDto.newServiceAreas &&
      updateFactoryDto.newServiceAreas.length > 0
    ) {
      const newServiceAreas = updateFactoryDto.newServiceAreas.map(
        (newServiceAreaDto) =>
          this.serviceAreaRepo.create({
            ...newServiceAreaDto,
            factoryId: updatedFactory.factoryId,
            updateUid: Uid,
          }),
      );
      await this.serviceAreaRepo.save(newServiceAreas);
    }

    return this.factoryRepo.findOne({
      where: { factoryId: id },
      relations: {
        serviceAreas: true,
        updateUser: true,
      }
    });
  }

  async findAll() {
    return await this.factoryRepo
      .createQueryBuilder('factory')
      .leftJoinAndSelect('factory.updateUser', 'updateUser')
      .addSelect(
        (subQuery) =>
          subQuery
            .select('COUNT(serviceArea.service_area_id)')
            .from('service_areas', 'serviceArea')
            .where('serviceArea.factory_id = factory.factory_id'),
        'serviceAreaCount',
      )
      .getRawAndEntities()
      .then((result) =>
        result.entities.map((entity, index) => ({
          ...entity,
          serviceAreaCount: parseInt(result.raw[index].serviceAreaCount, 10),
        })),
      );
  }

  async findOne(id: number) {
    return await this.factoryRepo
      .createQueryBuilder('factory')
      .where('factory.factory_id = :id', { id })
      .leftJoinAndSelect('factory.serviceAreas', 'serviceArea')
      .leftJoinAndSelect('factory.updateUser', 'updateUser')
      .addSelect(
        (subQuery) =>
          subQuery
            .select('COUNT(serviceArea.service_area_id)')
            .from('service_areas', 'serviceArea')
            .where('serviceArea.factory_id = factory.factory_id'),
        'serviceAreaCount',
      )
      .getRawAndEntities()
      .then(
        (result) =>
          result.entities.map((entity, index) => ({
            ...entity,
            serviceAreaCount: parseInt(result.raw[index].serviceAreaCount, 10),
          }))[0],
      );
  }

  async remove(id: number) {
    const serviceAreaCount = await this.serviceAreaRepo.count({
      where: { factoryId: id },
    });

    if (serviceAreaCount > 0) {
      throw new ConflictException(
        'ไม่สามารถลบโรงงานได้เนื่องจากมีเขตส่งเสริมในโรงงานนี้',
      );
    }

    return this.factoryRepo.delete(id);
  }

  async getSummary() {
    const factories = await this.findAll();

    const factorySummary: FactorySummaryDTO = {
      totalFactories: factories.length,
      totalServiceAres: 0
    }

    factories.forEach((factory) => {
      factorySummary.totalServiceAres += factory.serviceAreaCount;
    })

    return factorySummary;
  }
  getLogs() {
    return this.factoryLog.find();
  }
}
