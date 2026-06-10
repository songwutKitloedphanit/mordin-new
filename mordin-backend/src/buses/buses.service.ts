import {
  createParamDecorator,
  Injectable,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { CreateBusDto } from './dto/create-bus.dto';
import { UpdateBusDto } from './dto/update-bus.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Bus } from './entities/bus.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { Province } from 'src/address/provinces/entities/province.entity';
import { BusSummaryDTO } from './dto/bus-summary.dto';
import { BusLog } from './entities/bus.log.entity';

@Injectable()
export class BusesService {
  constructor(
    @InjectRepository(Bus)
    private busRepo: Repository<Bus>,

    @InjectRepository(BusLog)
    private busLog: Repository<BusLog>
  ) {}

  create(createBusDto: CreateBusDto , Uid: number) {
    const bus = this.busRepo.create({
      ...createBusDto,
      updatedUid: Uid,
    });
    return this.busRepo.save(bus);
  }

  findAll() {
    const buses = this.busRepo.find({
      relations: ['registrationProvince'],
    });

    return buses;
  }

  findOne(id: number) {
    return this.busRepo.findOneBy({ busId: id });
  }

  async update(id: number, updateBusDto: UpdateBusDto, Uid: number) {

    const bus = await this.busRepo.findOneBy({ busId: id });
    if (!bus) {
      throw new NotFoundException('Bus not found');
    }
    Object.assign(bus, updateBusDto, { updatedUid: Uid });
    return this.busRepo.save(bus);
  }

  async remove(id: number, userId): Promise<void> {
    // 1. ค้นหา Entity ที่ต้องการลบ
    const bus = await this.busRepo.findOneBy({ busId: id });
    if (!bus) {
      throw new NotFoundException('Bus not found');
    }

    // 2. แนบ userId เข้าไปใน property ที่เรานิยามไว้ใน .d.ts
    bus.removedBy = userId;

    // 3. ส่ง Entity object ที่แก้ไขแล้วไปให้ .remove()
    await this.busRepo.remove(bus);
  }

  async getSummary() {
    const buses = await this.findAll();

    const busSummary: BusSummaryDTO = {
      totalBuses : buses.length,
    }

    return busSummary;
  }

  getLogs(){
    return this.busLog.find();
  }
}
