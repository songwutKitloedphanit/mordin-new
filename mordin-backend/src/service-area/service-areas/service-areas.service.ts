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
import { DataSource, Repository } from 'typeorm';

import { Factory } from '../factories/entities/factory.entity';

import { ServiceArea } from './entities/service-area.entity';
import { ServiceAreaLog } from './entities/service-area.log.entity';

@Injectable()
export class ServiceAreasService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(ServiceArea)
    private readonly serviceAreaRepo: Repository<ServiceArea>,
    @InjectRepository(ServiceAreaLog, 'logs')
    private readonly serviceAreaLogRepo: Repository<ServiceAreaLog>,
    private readonly auditOutbox: AuditOutboxService
  ) {}

  private publicDto(area: ServiceArea) {
    return {
      serviceAreaId: area.serviceAreaId,
      factoryId: area.factoryId,
      code: area.code,
      name: area.name,
    };
  }

  private managementDto(area: ServiceArea) {
    return { ...area };
  }

  private snapshot(area: ServiceArea) {
    return {
      serviceAreaId: area.serviceAreaId,
      factoryId: area.factoryId,
      code: area.code,
      name: area.name,
      note: area.note ?? null,
      updateUid: area.updateUid,
    };
  }

  async findAll() {
    return (await this.serviceAreaRepo.find({ order: { name: 'ASC' } })).map(
      area => this.publicDto(area)
    );
  }

  async findAllManagement() {
    const areas = await this.serviceAreaRepo.find({
      relations: { factory: true, updateUser: true },
      order: { name: 'ASC' },
    });
    return areas.map(area => this.managementDto(area));
  }

  async findOne(id: number) {
    const serviceArea = await this.serviceAreaRepo.findOne({
      where: { serviceAreaId: id },
    });
    return serviceArea ? this.publicDto(serviceArea) : null;
  }

  async findByFactoryId(factoryId: number) {
    return (
      await this.serviceAreaRepo.find({
        where: { factoryId },
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

  async move(id: number, factoryId: number, userId: number) {
    return this.dataSource.transaction(async manager => {
      const serviceArea = await manager.findOne(ServiceArea, {
        where: { serviceAreaId: id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!serviceArea) {
        throw new BadRequestException('Promotion zone not found');
      }

      const targetFactory = await manager.findOne(Factory, {
        where: { factoryId },
      });
      if (!targetFactory) {
        throw new BadRequestException('Target factory not found');
      }

      if (serviceArea.factoryId === factoryId) {
        return this.publicDto(serviceArea);
      }

      const farmerCount = await manager.count(Farmer, {
        where: { serviceAreaId: id },
      });
      const bookCount = await manager.count(Book, {
        where: { serviceAreaId: id },
      });
      const qrCodeCount = await manager.count(QrCode, {
        where: { serviceAreaId: id },
      });

      if (farmerCount > 0 || bookCount > 0 || qrCodeCount > 0) {
        throw new ConflictException(
          'Cannot move a promotion zone that is already referenced by farmers, books, or QR codes.'
        );
      }

      const beforeArea = this.snapshot(serviceArea);
      serviceArea.factoryId = factoryId;
      serviceArea.updateUid = userId;

      const savedArea = await manager.save(serviceArea);
      await this.auditOutbox.enqueue(
        manager,
        'service_area',
        id,
        'update',
        userId,
        beforeArea,
        this.snapshot(savedArea)
      );

      return this.publicDto(savedArea);
    });
  }

  getLogs() {
    return this.serviceAreaLogRepo.find();
  }
}
