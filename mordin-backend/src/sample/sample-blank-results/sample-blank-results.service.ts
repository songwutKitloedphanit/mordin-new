import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateSampleBlankResultDto } from './dto/create-sample-blank-result.dto';
import { UpdateSampleBlankResultDto } from './dto/update-sample-blank-result.dto';
import { SampleBlankResult } from './entities/sample-blank-result.entity';
import { SampleBlankResultLog } from './entities/sample-blank-result.log.entity';

@Injectable()
export class SampleBlankResultsService {
  constructor(
    @InjectRepository(SampleBlankResult)
    private sampleBlankResultRepo: Repository<SampleBlankResult>,

    @InjectRepository(SampleBlankResultLog)
    private sampleBlankResultLog: Repository<SampleBlankResultLog>
  ) {}

  create(createSampleBlankResultDto: CreateSampleBlankResultDto, Uid: number) {
    return 'This action adds a new sampleBlankResult';
  }

  findAll() {
    return `This action returns all sampleBlankResults`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sampleBlankResult`;
  }

  // update(id: number, updateSampleBlankResultDto: UpdateSampleBlankResultDto) {
  //   return `This action updates a #${id} sampleBlankResult`;
  // }

  remove(id: number) {
    return `This action removes a #${id} sampleBlankResult`;
  }

  //  async createBySampleBlank(sampleBlankId:number, repeatNumber:number ,createSampleBlankResultDto: CreateSampleBlankResultDto) {
  //   const mockUpdateUid = 1;
  //   const sampleBlankResult = this.sampleBlankResultRepo.create({
  //     ...createSampleBlankResultDto,
  //     sampleBlankId: sampleBlankId,
  //     repeatNumber: repeatNumber,
  //     recordedUid: mockUpdateUid
  //   })
  //   return this.sampleBlankResultRepo.save(sampleBlankResult);
  // }
  async createBySampleBlank(
    sampleBlankId: number,
    dto: CreateSampleBlankResultDto
  ) {
    const mockUpdateUid = 1;
    const entity = this.sampleBlankResultRepo.create({
      sampleBlankId,
      recordedUid: mockUpdateUid,
      ...dto,
    });
    return this.sampleBlankResultRepo.save(entity);
  }

  async update(id: number, dto: UpdateSampleBlankResultDto, Uid: number) {
    const resultToUpdate = await this.sampleBlankResultRepo.findOne({
      where: { sampleBlankResultId: id },
    });

    if (!resultToUpdate) {
      throw new NotFoundException(`SampleBlankResult with id ${id} not found`);
    }

    this.sampleBlankResultRepo.merge(resultToUpdate, dto);

    resultToUpdate.recordedUid = Uid;

    return this.sampleBlankResultRepo.save(resultToUpdate);
  }

  getLogs() {
    return this.sampleBlankResultLog.find();
  }
}
