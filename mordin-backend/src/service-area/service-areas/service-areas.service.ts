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
import { Factory } from '../factories/entities/factory.entity';
import { MoveServiceAreaDto } from './dto/move-service-area.dto';
import { SupersedeServiceAreaDto } from './dto/supersede-service-area.dto';
import { ServiceArea } from './entities/service-area.entity';
import { ServiceAreaLog } from './entities/service-area.log.entity';
import { normalizeServiceAreaCode } from './service-area-code.util';

@Injectable()
export class ServiceAreasService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(ServiceArea)
    private readonly serviceAreaRepo: Repository<ServiceArea>,
    @InjectRepository(ServiceAreaLog, 'logs')
    private readonly serviceAreaLogRepo: Repository<ServiceAreaLog>,
    @InjectRepository(Farmer) private readonly farmerRepo: Repository<Farmer>,
    @InjectRepository(Book) private readonly bookRepo: Repository<Book>,
    @InjectRepository(QrCode) private readonly qrCodeRepo: Repository<QrCode>,
    private readonly auditOutbox: AuditOutboxService
  ) {}

  async findAll() {
    return (
      await this.serviceAreaRepo.find({
        where: { isActive: true },
        order: { name: 'ASC' },
      })
    ).map(area => this.publicDto(area));
  }

  async findAllManagement() {
    const areas = await this.serviceAreaRepo.find({
      relations: { factory: true, updateUser: true },
      order: { name: 'ASC' },
    });
    return Promise.all(areas.map(area => this.managementDto(area)));
  }

  async findOne(id: number) {
    const serviceArea = await this.serviceAreaRepo.findOne({
      where: { serviceAreaId: id, isActive: true },
    });
    return serviceArea ? this.publicDto(serviceArea) : null;
  }

  async findByFactoryId(factoryId: number) {
    return (
      await this.serviceAreaRepo.find({
        where: { factoryId, isActive: true },
        order: { name: 'ASC' },
      })
    ).map(area => this.publicDto(area));
  }

  async remove(id: number, userId: number) {
    return this.dataSource.transaction(async manager => {
      const serviceArea = await manager.findOne(ServiceArea, {
        where: { serviceAreaId: id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!serviceArea) {
        throw new BadRequestException('Promotion zone not found');
      }
      if (!serviceArea.isActive) {
        throw new ConflictException(
          'Cannot delete an inactive promotion zone history record'
        );
      }
      if (await this.isServiceAreaUsed(id, manager)) {
        throw new ConflictException(
          'Cannot delete a promotion zone that has already been used'
        );
      }
      await this.auditOutbox.enqueue(
        manager,
        'service_area',
        id,
        'delete',
        userId,
        this.snapshot(serviceArea),
        null
      );
      return manager.remove(serviceArea);
    });
  }

  async move(id: number, dto: MoveServiceAreaDto, userId: number) {
    try {
      return await this.dataSource.transaction(async manager => {
        const serviceArea = await manager.findOne(ServiceArea, {
          where: { serviceAreaId: id },
          lock: { mode: 'pessimistic_write' },
        });
        if (!serviceArea) {
          throw new BadRequestException('Promotion zone not found');
        }
        if (!serviceArea.isActive) {
          throw new ConflictException(
            'Cannot move an inactive promotion zone history record'
          );
        }
        if (serviceArea.factoryId === dto.targetFactoryId) {
          throw new BadRequestException(
            'Promotion zone is already assigned to the target factory'
          );
        }
        const targetFactory = await manager.findOne(Factory, {
          where: { factoryId: dto.targetFactoryId },
        });
        if (!targetFactory) {
          throw new BadRequestException('Target factory not found');
        }
        if (await this.isServiceAreaUsed(id, manager)) {
          throw new ConflictException(
            'Cannot move a promotion zone that has already been used. Add a new zone instead.'
          );
        }

        const beforeArea = this.snapshot(serviceArea);
        serviceArea.factoryId = targetFactory.factoryId;
        serviceArea.updateUid = userId;
        const savedArea = await manager.save(serviceArea);
        await this.auditOutbox.enqueue(
          manager,
          'service_area',
          id,
          'move',
          userId,
          beforeArea,
          this.snapshot(savedArea)
        );
        return savedArea;
      });
    } catch (error: unknown) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string })?.code === '23505'
      ) {
        throw new ConflictException(
          'Target factory already has this promotion-zone code'
        );
      }
      throw error;
    }
  }

  async supersede(id: number, dto: SupersedeServiceAreaDto, userId: number) {
    try {
      return await this.dataSource.transaction(async manager => {
        const serviceArea = await manager.findOne(ServiceArea, {
          where: { serviceAreaId: id },
          lock: { mode: 'pessimistic_write' },
        });
        if (!serviceArea) {
          throw new BadRequestException('Promotion zone not found');
        }
        if (!serviceArea.isActive) {
          throw new ConflictException(
            'Cannot supersede an inactive promotion zone history record'
          );
        }
        if (!(await this.isServiceAreaUsed(id, manager))) {
          throw new BadRequestException(
            'Promotion zone has not been used yet. Move or edit it directly instead.'
          );
        }

        const targetFactory = await manager.findOne(Factory, {
          where: { factoryId: dto.targetFactoryId },
        });
        if (!targetFactory) {
          throw new BadRequestException('Target factory not found');
        }

        const beforeArea = this.snapshot(serviceArea);
        serviceArea.isActive = false;
        serviceArea.effectiveTo = this.previousDate(dto.effectiveFrom);
        serviceArea.updateUid = userId;
        await manager.save(serviceArea);

        const newArea = await manager.save(
          manager.create(ServiceArea, {
            factoryId: targetFactory.factoryId,
            code: normalizeServiceAreaCode(dto.code ?? serviceArea.code),
            name: dto.name?.trim() || serviceArea.name,
            note: dto.note ?? serviceArea.note,
            isActive: true,
            effectiveFrom: dto.effectiveFrom,
            effectiveTo: null,
            supersededByServiceAreaId: null,
            updateUid: userId,
          })
        );

        serviceArea.supersededByServiceAreaId = newArea.serviceAreaId;
        const savedOldArea = await manager.save(serviceArea);

        await this.auditOutbox.enqueue(
          manager,
          'service_area',
          id,
          'supersede',
          userId,
          beforeArea,
          this.snapshot(savedOldArea)
        );
        await this.auditOutbox.enqueue(
          manager,
          'service_area',
          newArea.serviceAreaId,
          'create',
          userId,
          null,
          this.snapshot(newArea)
        );
        return this.managementDto(newArea, false);
      });
    } catch (error: unknown) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string })?.code === '23505'
      ) {
        throw new ConflictException(
          'Target factory already has an active promotion-zone code'
        );
      }
      throw error;
    }
  }

  getLogs() {
    return this.serviceAreaLogRepo.find();
  }

  private async isServiceAreaUsed(
    serviceAreaId: number,
    manager?: EntityManager
  ): Promise<boolean> {
    const farmerRepo = manager?.getRepository(Farmer) ?? this.farmerRepo;
    const bookRepo = manager?.getRepository(Book) ?? this.bookRepo;
    const qrCodeRepo = manager?.getRepository(QrCode) ?? this.qrCodeRepo;
    const [farmerCount, bookCount, qrCodeCount] = await Promise.all([
      farmerRepo.count({ where: { serviceAreaId } }),
      bookRepo.count({ where: { serviceAreaId } }),
      qrCodeRepo.count({ where: { serviceAreaId } }),
    ]);
    return farmerCount + bookCount + qrCodeCount > 0;
  }

  private publicDto(area: ServiceArea) {
    return {
      serviceAreaId: area.serviceAreaId,
      factoryId: area.factoryId,
      code: area.code,
      name: area.name,
    };
  }

  private async managementDto(area: ServiceArea, isUsed?: boolean) {
    return {
      ...area,
      isUsed: isUsed ?? (await this.isServiceAreaUsed(area.serviceAreaId)),
    };
  }

  private snapshot(area: ServiceArea) {
    return {
      serviceAreaId: area.serviceAreaId,
      factoryId: area.factoryId,
      code: area.code,
      name: area.name,
      note: area.note ?? null,
      isActive: area.isActive,
      effectiveFrom: area.effectiveFrom ?? null,
      effectiveTo: area.effectiveTo ?? null,
      supersededByServiceAreaId: area.supersededByServiceAreaId ?? null,
      updateUid: area.updateUid,
    };
  }

  private previousDate(date: string) {
    const value = new Date(`${date}T00:00:00.000Z`);
    value.setUTCDate(value.getUTCDate() - 1);
    return value.toISOString().slice(0, 10);
  }
}
