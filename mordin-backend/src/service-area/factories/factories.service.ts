import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { AuditOutboxService } from 'src/audit-outbox/audit-outbox.service';
import { Farmer } from 'src/farmers/entities/farmer.entity';
import { Book } from 'src/sample/books/entities/book.entity';
import { QrCode } from 'src/sample/qr-codes/entities/qr-code.entity';
import {
  DataSource,
  EntityManager,
  QueryFailedError,
  Repository,
} from 'typeorm';

import { CreateServiceAreaDto } from '../service-areas/dto/create-service-area.dto';
import { UpdateServiceAreaDto } from '../service-areas/dto/update-service-area.dto';
import { ServiceArea } from '../service-areas/entities/service-area.entity';
import { normalizeServiceAreaCode } from '../service-areas/service-area-code.util';

import { CreateFactoryDto } from './dto/create-factory.dto';
import { FactorySummaryDTO } from './dto/factory-summary.dto';
import { UpdateFactoryDto } from './dto/update-factory.dto';
import { Factory } from './entities/factory.entity';
import { FactoryLog } from './entities/factory.log.entity';

@Injectable()
export class FactoriesService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Factory)
    private readonly factoryRepo: Repository<Factory>,
    @InjectRepository(ServiceArea)
    private readonly serviceAreaRepo: Repository<ServiceArea>,
    @InjectRepository(FactoryLog, 'logs')
    private readonly factoryLogRepo: Repository<FactoryLog>,
    private readonly auditOutbox: AuditOutboxService
  ) {}

  private async createServiceAreas(
    manager: EntityManager,
    areas: CreateServiceAreaDto[],
    factoryId: number,
    userId: number
  ) {
    for (const area of areas) {
      const savedArea = await manager.save(
        manager.create(ServiceArea, {
          ...area,
          code: normalizeServiceAreaCode(area.code),
          factoryId,
          updateUid: userId,
        })
      );
      await this.auditOutbox.enqueue(
        manager,
        'service_area',
        savedArea.serviceAreaId,
        'create',
        userId,
        null,
        this.serviceAreaSnapshot(savedArea)
      );
    }
  }

  private async updateServiceArea(
    manager: EntityManager,
    factoryId: number,
    input: UpdateServiceAreaDto,
    userId: number
  ) {
    const serviceArea = await manager.findOne(ServiceArea, {
      where: { serviceAreaId: input.serviceAreaId, factoryId },
    });
    if (!serviceArea) {
      throw new BadRequestException('Service area not found in target factory');
    }
    const beforeArea = this.serviceAreaSnapshot(serviceArea);
    Object.assign(serviceArea, {
      ...input,
      code: input.code
        ? normalizeServiceAreaCode(input.code)
        : serviceArea.code,
      factoryId,
      updateUid: userId,
    });
    if (
      JSON.stringify(beforeArea) ===
      JSON.stringify(this.serviceAreaSnapshot(serviceArea))
    ) {
      return;
    }

    const farmerCount = await manager.count(Farmer, {
      where: { serviceAreaId: input.serviceAreaId },
    });
    const bookCount = await manager.count(Book, {
      where: { serviceAreaId: input.serviceAreaId },
    });
    const qrCodeCount = await manager.count(QrCode, {
      where: { serviceAreaId: input.serviceAreaId },
    });

    if (farmerCount > 0 || bookCount > 0 || qrCodeCount > 0) {
      throw new ConflictException(
        'Cannot modify a promotion zone that is already referenced by farmers, books, or QR codes.'
      );
    }

    await manager.save(serviceArea);
    await this.auditOutbox.enqueue(
      manager,
      'service_area',
      serviceArea.serviceAreaId,
      'update',
      userId,
      beforeArea,
      this.serviceAreaSnapshot(serviceArea)
    );
  }

  private factoryPublicDto(factory: Factory) {
    return {
      factoryId: factory.factoryId,
      name: factory.name,
      initial: factory.initial,
    };
  }

  private serviceAreaPublicDto(area: ServiceArea) {
    return {
      serviceAreaId: area.serviceAreaId,
      factoryId: area.factoryId,
      code: area.code,
      name: area.name,
    };
  }

  private factorySnapshot(factory: Factory) {
    return {
      factoryId: factory.factoryId,
      name: factory.name,
      initial: factory.initial,
      note: factory.note ?? null,
      updateUid: factory.updateUid,
    };
  }

  private serviceAreaSnapshot(area: ServiceArea) {
    return {
      serviceAreaId: area.serviceAreaId,
      factoryId: area.factoryId,
      code: area.code,
      name: area.name,
      note: area.note ?? null,
      updateUid: area.updateUid,
    };
  }

  private async handleConflict<T>(callback: () => Promise<T>): Promise<T> {
    try {
      return await callback();
    } catch (error: unknown) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string })?.code === '23505'
      ) {
        throw new ConflictException(
          'Duplicate factory or active promotion-zone code'
        );
      }
      throw error;
    }
  }

  async create(createFactoryDto: CreateFactoryDto, userId: number) {
    return this.handleConflict(() =>
      this.dataSource.transaction(async manager => {
        const { serviceAreas = [], ...factoryInput } = createFactoryDto;
        const factory = manager.create(Factory, {
          ...factoryInput,
          updateUid: userId,
        });
        const savedFactory = await manager.save(factory);
        await this.auditOutbox.enqueue(
          manager,
          'factory',
          savedFactory.factoryId,
          'create',
          userId,
          null,
          this.factorySnapshot(savedFactory)
        );
        await this.createServiceAreas(
          manager,
          serviceAreas,
          savedFactory.factoryId,
          userId
        );
        return savedFactory;
      })
    );
  }

  async update(id: number, dto: UpdateFactoryDto, userId: number) {
    return this.handleConflict(() =>
      this.dataSource.transaction(async manager => {
        const factory = await manager.findOne(Factory, {
          where: { factoryId: id },
        });
        if (!factory) {
          throw new BadRequestException(`Factory with ID ${id} not found`);
        }

        const beforeFactory = this.factorySnapshot(factory);
        Object.assign(factory, {
          name: dto.name,
          initial: dto.initial,
          note: dto.note,
          updateUid: userId,
        });
        await manager.save(factory);
        await this.auditOutbox.enqueue(
          manager,
          'factory',
          factory.factoryId,
          'update',
          userId,
          beforeFactory,
          this.factorySnapshot(factory)
        );

        for (const area of dto.serviceAreas ?? []) {
          await this.updateServiceArea(manager, id, area, userId);
        }
        await this.createServiceAreas(
          manager,
          dto.newServiceAreas ?? [],
          id,
          userId
        );
        return manager.findOne(Factory, {
          where: { factoryId: id },
          relations: { serviceAreas: true, updateUser: true },
        });
      })
    );
  }

  async findAll() {
    const factories = await this.factoryRepo.find({ order: { name: 'ASC' } });
    return factories.map(factory => this.factoryPublicDto(factory));
  }

  async findOne(id: number) {
    const factory = await this.factoryRepo.findOne({
      where: { factoryId: id },
      relations: { serviceAreas: true },
    });
    if (!factory) return null;
    return {
      ...this.factoryPublicDto(factory),
      serviceAreas: factory.serviceAreas.map(area =>
        this.serviceAreaPublicDto(area)
      ),
    };
  }

  async findAllManagement() {
    return this.factoryRepo
      .createQueryBuilder('factory')
      .leftJoinAndSelect('factory.updateUser', 'updateUser')
      .addSelect(
        subQuery =>
          subQuery
            .select('COUNT(serviceArea.service_area_id)')
            .from('service_areas', 'serviceArea')
            .where('serviceArea.factory_id = factory.factory_id'),
        'serviceAreaCount'
      )
      .getRawAndEntities()
      .then(result =>
        result.entities.map((entity, index) => ({
          ...entity,
          serviceAreaCount: parseInt(result.raw[index].serviceAreaCount, 10),
        }))
      );
  }

  async findOneManagement(id: number) {
    const factory = await this.factoryRepo
      .createQueryBuilder('factory')
      .where('factory.factory_id = :id', { id })
      .leftJoinAndSelect('factory.serviceAreas', 'serviceArea')
      .leftJoinAndSelect('factory.updateUser', 'updateUser')
      .getOne();
    if (!factory) return null;

    const serviceAreasWithUsage = await Promise.all(
      (factory.serviceAreas ?? []).map(async area => {
        const farmerCount = await this.dataSource.getRepository(Farmer).count({
          where: { serviceAreaId: area.serviceAreaId },
        });
        const bookCount = await this.dataSource.getRepository(Book).count({
          where: { serviceAreaId: area.serviceAreaId },
        });
        const qrCodeCount = await this.dataSource.getRepository(QrCode).count({
          where: { serviceAreaId: area.serviceAreaId },
        });
        return {
          ...area,
          isUsed: farmerCount > 0 || bookCount > 0 || qrCodeCount > 0,
        };
      })
    );

    serviceAreasWithUsage.sort((a, b) => a.code.localeCompare(b.code));

    return {
      ...factory,
      serviceAreas: serviceAreasWithUsage,
    };
  }

  async remove(id: number, userId: number) {
    return this.dataSource.transaction(async manager => {
      const factory = await manager.findOne(Factory, {
        where: { factoryId: id },
      });
      if (!factory) {
        throw new BadRequestException(`Factory with ID ${id} not found`);
      }
      if (await manager.count(ServiceArea, { where: { factoryId: id } })) {
        throw new ConflictException(
          'Cannot delete a factory that still has promotion zones'
        );
      }
      await this.auditOutbox.enqueue(
        manager,
        'factory',
        id,
        'delete',
        userId,
        this.factorySnapshot(factory),
        null
      );
      return manager.remove(factory);
    });
  }

  async getSummary(): Promise<FactorySummaryDTO> {
    return {
      totalFactories: await this.factoryRepo.count(),
      totalServiceAres: await this.serviceAreaRepo.count(),
    };
  }

  getLogs() {
    return this.factoryLogRepo.find();
  }
}
