import { Injectable } from '@nestjs/common';
import { CreateServiceLaboratoryDto } from './dto/create-service-laboratory.dto';
import { UpdateServiceLaboratoryDto } from './dto/update-service-laboratory.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceLaboratory } from './entities/service-laboratory.entity';
import { Repository } from 'typeorm';
import { ServiceType } from '../service-types/entities/service-type.entity';
import { ServiceLaboratoryLog } from './entities/service-laboratory.log.entity';

@Injectable()
export class ServiceLaboratoriesService {
  constructor(
    @InjectRepository(ServiceLaboratory)
    private readonly serviceLaboratoryRepository: Repository<ServiceLaboratory>,

    @InjectRepository(ServiceType)
    private readonly serviceTypeRepo: Repository<ServiceType>,
    @InjectRepository(ServiceLaboratoryLog)
    private readonly serviceLaboratoryLog: Repository<ServiceLaboratoryLog>,
  ) {}
  create(createServiceLaboratoryDto: CreateServiceLaboratoryDto, Uid : number) {
    return 'This action adds a new serviceLaboratory';
  }

  findAll() {
    return this.serviceLaboratoryRepository.find({
      relations: ['laboratories'],
    });
  }

  findOne(id: number) {
    // return this.serviceLaboratoryRepository.findOneBy({ serviceLaboratoryId: id });
  }

  update(id: number, updateServiceLaboratoryDto: UpdateServiceLaboratoryDto, Uid : number) {
    return `This action updates a #${id} serviceLaboratory`;
  }

  remove(id: number) {
    return `This action removes a #${id} serviceLaboratory`;
  }

  async createByNewLaboratoryId(laboratoryId: number) {
    const serviceTypes = await this.serviceTypeRepo.find();

    for (const servType of serviceTypes) {
      const serviceLaboratory = this.serviceLaboratoryRepository.create({
        serviceTypeId: servType.serviceTypeId,
        laboratoryId: laboratoryId,
        isDisplay: false,
      });
      await this.serviceLaboratoryRepository.save(serviceLaboratory);
    }
  }

  getLogs() {
    return this.serviceLaboratoryLog.find();
  }
}
