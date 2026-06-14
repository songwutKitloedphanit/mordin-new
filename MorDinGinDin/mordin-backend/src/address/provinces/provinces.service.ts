import { Injectable } from '@nestjs/common';
import { CreateProvinceDto } from './dto/create-province.dto';
import { UpdateProvinceDto } from './dto/update-province.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Province } from './entities/province.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProvincesService {
  constructor(
    @InjectRepository(Province)
    private provinceRepo: Repository<Province>,
  ) {}

  create(createProvinceDto: CreateProvinceDto) {
    return 'This action adds a new province';
  }

  findAll() {
    return this.provinceRepo.find({
      relations : ['geography']
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} province`;
  }

  update(id: number, updateProvinceDto: UpdateProvinceDto) {
    return `This action updates a #${id} province`;
  }

  remove(id: number) {
    return `This action removes a #${id} province`;
  }

  getProvinceByGeographyId(geographyId: number) {
    return this.provinceRepo.find({
      where : { geographyId },
      relations : ['geography']
    })
  }
}
