import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateGeographyDto } from './dto/create-geography.dto';
import { UpdateGeographyDto } from './dto/update-geography.dto';
import { Geography } from './entities/geography.entity';

@Injectable()
export class GeographiesService {
  constructor(
    @InjectRepository(Geography)
    private geographyRepo: Repository<Geography>
  ) {}

  create(createGeographyDto: CreateGeographyDto) {
    return 'This action adds a new geography';
  }

  findAll() {
    return this.geographyRepo.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} geography`;
  }

  update(id: number, updateGeographyDto: UpdateGeographyDto) {
    return `This action updates a #${id} geography`;
  }

  remove(id: number) {
    return `This action removes a #${id} geography`;
  }
}
