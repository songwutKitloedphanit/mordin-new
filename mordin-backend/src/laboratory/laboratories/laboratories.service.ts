import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLaboratoryDto } from './dto/create-laboratory.dto';
import { UpdateLaboratoryDto } from './dto/update-laboratory.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Laboratory } from './entities/laboratory.entity';
import { Repository } from 'typeorm';
import { ServiceLaboratoriesService } from 'src/service-type/service-laboratories/service-laboratories.service';
import { LaboratorySettingsService } from '../laboratory-settings/laboratory-settings.service';
import { LaboratoryLog } from './entities/laboratory.log.entity';

@Injectable()
export class LaboratoriesService {
  constructor(
    @InjectRepository(Laboratory)
    private readonly laboratoryRepository: Repository<Laboratory>,

    @InjectRepository(LaboratoryLog)
    private readonly laboratoryLog: Repository<LaboratoryLog>,

    private readonly ServLabService: ServiceLaboratoriesService,
    private readonly labSettingsService: LaboratorySettingsService,
  ) {}

  async create(createLaboratoryDto: CreateLaboratoryDto, Uid: number) {
    const laboratory = this.laboratoryRepository.create({
      ...createLaboratoryDto,
      updateUid: Uid,
    });
    const savedLab = await this.laboratoryRepository.save(laboratory);
    await this.ServLabService.createByNewLaboratoryId(savedLab.laboratoryId);
    await this.labSettingsService.createByNewLabIdForUpcomingCalendar(
      savedLab.laboratoryId,
      Uid,
    );
    return savedLab;
  }

  findAll() {
    return this.laboratoryRepository
      .createQueryBuilder('laboratory')
      .leftJoinAndSelect('laboratory.updateUser', 'updateUser')
      .leftJoinAndSelect('laboratory.machineType', 'machineType')
      .getMany();
  }

  findOne(id: number) {
    return this.laboratoryRepository
      .createQueryBuilder('laboratory')
      .where('laboratory.laboratory_id = :id', { id })
      .leftJoinAndSelect('laboratory.updateUser', 'updateUser')
      .leftJoinAndSelect('laboratory.machineType', 'machineType')
      .getOne();
  }

  async update(id: number, updateLaboratoryDto: UpdateLaboratoryDto, Uid: number) {
    const laboratory = await this.laboratoryRepository.findOneBy({
      laboratoryId: id,
    });
    if (!laboratory) {
      throw new NotFoundException('Laboratory not found');
    }
    Object.assign(laboratory, updateLaboratoryDto, {
      updateUid: Uid,
    });
    return this.laboratoryRepository.save(laboratory);
  }

  async remove(id: number) {
    const laboratory = await this.laboratoryRepository.findOneBy({
      laboratoryId: id,
    });
    if (laboratory) {
      this.laboratoryRepository.remove(laboratory);
    }
    return { deleted: !!laboratory };
  }

  getLogs() {
    return this.laboratoryLog.find();
  }
}
