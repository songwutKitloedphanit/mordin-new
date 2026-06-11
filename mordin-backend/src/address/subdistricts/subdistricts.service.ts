import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateSubdistrictDto } from './dto/create-subdistrict.dto';
import { UpdateSubdistrictDto } from './dto/update-subdistrict.dto';
import { Subdistrict } from './entities/subdistrict.entity';

@Injectable()
export class SubdistrictsService {
  constructor(
    @InjectRepository(Subdistrict)
    private subdistrictRepo: Repository<Subdistrict>
  ) {}

  create(createSubdistrictDto: CreateSubdistrictDto) {
    return 'This action adds a new subdistrict';
  }

  findAll() {
    return this.subdistrictRepo.find({
      // relations: ["district", "district.province"]
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} subdistrict`;
  }

  update(id: number, updateSubdistrictDto: UpdateSubdistrictDto) {
    return `This action updates a #${id} subdistrict`;
  }

  remove(id: number) {
    return `This action removes a #${id} subdistrict`;
  }

  getSubdistrictsByDistrictCode(districtCode: number) {
    return this.subdistrictRepo.find({
      where: { districtCode },
      relations: ['district'],
    });
  }
}
