import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateFertilizerMinorDto } from './dto/create-fertilizer-minor.dto';
import { UpdateFertilizerMinorDto } from './dto/update-fertilizer-minor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FertilizerMinor } from './entities/fertilizer-minor.entity';
import { Repository } from 'typeorm';
import { ServiceFertilizerMinor } from '../service-fertilizer-minors/entities/service-fertilizer-minor.entity';
import { ServiceType } from 'src/service-type/service-types/entities/service-type.entity';
import { FertilizerMinorLog } from './entities/fertilizer-minor.log.entity';

@Injectable()
export class FertilizerMinorsService {
  constructor(
    @InjectRepository(FertilizerMinor)
    private readonly fertilizerMinorRepository: Repository<FertilizerMinor>,

    @InjectRepository(ServiceFertilizerMinor)
    private readonly servFerMinorRepo: Repository<ServiceFertilizerMinor>,

    @InjectRepository(ServiceType)
    private readonly serviceTypeRepo: Repository<ServiceType>,

    @InjectRepository(FertilizerMinorLog)
    private readonly fertilizerMinorLog: Repository<FertilizerMinorLog>,
  ) { }

  async create(createFertilizerMinorDto: CreateFertilizerMinorDto, Uid: number) {
    const fertilizerMinor = this.fertilizerMinorRepository.create({
      ...createFertilizerMinorDto,
      updateUid: Uid,
    });
    const newFerMinor =
      await this.fertilizerMinorRepository.save(fertilizerMinor);
    const serviceTypes = await this.serviceTypeRepo.find();
    for (const serviceType of serviceTypes) {
      const serviceFertilizerMinor = this.servFerMinorRepo.create({
        fertilizerMinorId: newFerMinor.fertilizerMinorId,
        serviceTypeId: serviceType.serviceTypeId,
        unitId: createFertilizerMinorDto.unitId,
        updateUid: Uid,
      });
      await this.servFerMinorRepo.save(serviceFertilizerMinor);
    }
    return newFerMinor;
  }

  findAll() {
    return this.fertilizerMinorRepository
      .createQueryBuilder('fertilizerMinor')
      .leftJoinAndSelect('fertilizerMinor.updateUser', 'updateUser')
      .leftJoinAndSelect('fertilizerMinor.unit', 'unit')
      .getMany();
  }

  findOne(id: number) {
    return this.fertilizerMinorRepository
      .createQueryBuilder('fertilizerMinor')
      .where('fertilizerMinor.fertilizer_minor_id = :id', { id })
      .leftJoinAndSelect('fertilizerMinor.updateUser', 'updateUser')
      .leftJoinAndSelect('fertilizerMinor.unit', 'unit')
      .getOne();
  }

  async update(id: number, updateFertilizerMinorDto: UpdateFertilizerMinorDto, Uid: number) {
    const fertilizerMinor = await this.fertilizerMinorRepository.findOneBy({
      fertilizerMinorId: id,
    });
    if (!fertilizerMinor) {
      throw new NotFoundException('Fertilizer Minor not found');
    }
    Object.assign(fertilizerMinor, updateFertilizerMinorDto, {
      updateUid: Uid,
    });
    return this.fertilizerMinorRepository.save(fertilizerMinor);
  }

  async remove(id: number, userId: number) {
    const serviceMinors = await this.servFerMinorRepo.find({
      where: { fertilizerMinorId: id },
      relations: { serviceFertilizerMinorUsages: true },
    });

    const hasUsage = serviceMinors.some(
      (sm) =>
        sm.serviceFertilizerMinorUsages &&
        sm.serviceFertilizerMinorUsages.length > 0
    );

    if (hasUsage) {
      throw new BadRequestException(
        'ไม่สามารถลบได้เนื่องจากปุ๋ยนี้มีการนำไปใช้ที่อื่นแล้ว'
      );
    }

    const fertilizerMinor = await this.fertilizerMinorRepository.findOneBy({
      fertilizerMinorId: id,
    });
    if (!fertilizerMinor) {
      throw new NotFoundException('FertilizerMinor not found');
    }

    // fertilizerMinor.removedBy = userId; // Cannot update if just removing, assuming hard delete based on Major implementation

    await this.fertilizerMinorRepository.remove(fertilizerMinor);
  }

  getLogs() {
    return this.fertilizerMinorLog.find();
  }
}
