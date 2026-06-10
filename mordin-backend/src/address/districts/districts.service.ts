import { Injectable } from '@nestjs/common';
import { CreateDistrictDto } from './dto/create-district.dto';
import { UpdateDistrictDto } from './dto/update-district.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { District } from './entities/district.entity';

@Injectable()
export class DistrictsService {
  constructor(
    @InjectRepository(District)
    private provinceRepo: Repository<District>,
  ) {}

  create(createDistrictDto: CreateDistrictDto) {
    return 'This action adds a new district';
  }

  findAll() {
    return this.provinceRepo.find({
      relations: ['province'],
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} district`;
  }

  update(id: number, updateDistrictDto: UpdateDistrictDto) {
    return `This action updates a #${id} district`;
  }

  remove(id: number) {
    return `This action removes a #${id} district`;
  }

  getDistrictsByProvinceCode(provinceCode: number) {
    return this.provinceRepo.find({
      where: { provinceCode },
      relations: ['province'],
    });
  }
}
