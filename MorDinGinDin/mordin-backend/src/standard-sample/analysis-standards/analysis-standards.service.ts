import { Injectable } from '@nestjs/common';
import { CreateAnalysisStandardDto } from './dto/create-analysis-standard.dto';
import { UpdateAnalysisStandardDto } from './dto/update-analysis-standard.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AnalysisStandard } from './entities/analysis-standard.entity';
import { Repository } from 'typeorm';
import { AnalysisStandardResultsService } from '../analysis-standard-results/analysis-standard-results.service';
import { AnalysisStandardLog } from './entities/analysis-standard.log.entity';

@Injectable()
export class AnalysisStandardsService {
  constructor(
    @InjectRepository(AnalysisStandard)
    private analysisStandardRepo: Repository<AnalysisStandard>,

    private readonly analysisStandardResultsService: AnalysisStandardResultsService,
    @InjectRepository(AnalysisStandard)
    private analysisStandardLog: Repository<AnalysisStandardLog>,
  ) { }
  async create(createAnalysisStandardDto: CreateAnalysisStandardDto,Uid : number) {
    const { serviceCalendarId, standard } = createAnalysisStandardDto;
    const analysisStandard = this.analysisStandardRepo.create(
      standard.map(dto => ({
        ...dto,
        serviceCalendarId,
        updateUid: Uid, 
      })),
    );
    const standards = await this.analysisStandardRepo.save(analysisStandard);
    if (standards.length) {
      await Promise.all(
        standards.map((standard) =>
          this.analysisStandardResultsService.createWithAnalysisStandard(
            standard
          ),
        ),
      );
    }
  }

  async findAll() {
    return await this.analysisStandardRepo.find();
  }

  async findAnalysisStandardByServiceCalendarId(serviceCalendarId: number) {
    return await this.analysisStandardRepo.find({
      where: { serviceCalendarId },
      relations: ['standard', 'updatedUser', 'standard.standardCertificates', 'standard.standardCertificates.laboratory', 'analysisStandardResults', 'analysisStandardResults.laboratorySetting',
        'analysisStandardResults.laboratorySetting.laboratory',],
      order: { analysisStandardId: 'ASC' },
    });
  }


  findOne(id: number) {
    return `This action returns a #${id} analysisStandard`;
  }

  update(id: number, updateAnalysisStandardDto: UpdateAnalysisStandardDto,Uid : number) {
    return `This action updates a #${id} analysisStandard`;
  }

  remove(id: number) {
    return `This action removes a #${id} analysisStandard`;
  }
  getLogs() {
    return this.analysisStandardLog.find();
  }
}
