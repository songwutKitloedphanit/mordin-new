import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AnalysisStandardResultsService } from '../analysis-standard-results/analysis-standard-results.service';

import { CreateAnalysisStandardDto } from './dto/create-analysis-standard.dto';
import { UpdateAnalysisStandardDto } from './dto/update-analysis-standard.dto';
import { AnalysisStandard } from './entities/analysis-standard.entity';
import { AnalysisStandardLog } from './entities/analysis-standard.log.entity';

@Injectable()
export class AnalysisStandardsService {
  constructor(
    @InjectRepository(AnalysisStandard)
    private analysisStandardRepo: Repository<AnalysisStandard>,

    private readonly analysisStandardResultsService: AnalysisStandardResultsService,
    @InjectRepository(AnalysisStandard)
    private analysisStandardLog: Repository<AnalysisStandardLog>
  ) {}

  async create(
    createAnalysisStandardDto: CreateAnalysisStandardDto,
    Uid: number
  ) {
    const { serviceCalendarId, standard } = createAnalysisStandardDto;
    const analysisStandard = this.analysisStandardRepo.create(
      standard.map(dto => ({
        ...dto,
        serviceCalendarId,
        updateUid: Uid,
      }))
    );
    let standards: AnalysisStandard[];
    try {
      standards = await this.analysisStandardRepo.save(analysisStandard);
    } catch (err: any) {
      if (err?.code === '23505') {
        throw new BadRequestException(
          'มาตรฐานนี้ถูกเพิ่มไว้แล้วในวันให้บริการนี้'
        );
      }
      throw err;
    }
    if (standards.length) {
      await Promise.all(
        standards.map(standard =>
          this.analysisStandardResultsService.createWithAnalysisStandard(
            standard
          )
        )
      );
    }
  }

  async findAll() {
    return await this.analysisStandardRepo.find();
  }

  async findAnalysisStandardByServiceCalendarId(serviceCalendarId: number) {
    return await this.analysisStandardRepo.find({
      where: { serviceCalendarId },
      relations: [
        'standard',
        'updatedUser',
        'standard.standardCertificates',
        'standard.standardCertificates.laboratory',
        'analysisStandardResults',
        'analysisStandardResults.laboratorySetting',
        'analysisStandardResults.laboratorySetting.laboratory',
      ],
      order: { analysisStandardId: 'ASC' },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} analysisStandard`;
  }

  update(
    id: number,
    updateAnalysisStandardDto: UpdateAnalysisStandardDto,
    Uid: number
  ) {
    return `This action updates a #${id} analysisStandard`;
  }

  async remove(id: number) {
    await this.analysisStandardRepo.delete(id);
  }

  getLogs() {
    return this.analysisStandardLog.find();
  }
}
