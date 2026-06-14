import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AnalysisStandardResultsService } from '../analysis-standard-results/analysis-standard-results.service';

import { CreateAnalysisStandardDto } from './dto/create-analysis-standard.dto';
import { UpdateAnalysisStandardRepeatDto } from './dto/update-analysis-standard-repeat.dto';
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

  async update(
    id: number,
    updateAnalysisStandardRepeatDto: UpdateAnalysisStandardRepeatDto,
    Uid: number
  ) {
    const newCount = updateAnalysisStandardRepeatDto.repeatCount;

    const analysisStandard = await this.analysisStandardRepo.findOne({
      where: { analysisStandardId: id },
      relations: ['analysisStandardResults'],
    });
    if (!analysisStandard) {
      throw new NotFoundException('Analysis standard not found');
    }

    const oldCount = analysisStandard.repeatCount;
    if (newCount === oldCount) return;

    if (newCount > oldCount) {
      // grow: append result rows for the new repeat numbers only
      await this.analysisStandardResultsService.createResultsForRepeatRange(
        analysisStandard,
        oldCount + 1,
        newCount
      );
    } else {
      // shrink: drop result rows for the trailing repeat numbers
      await this.analysisStandardResultsService.removeResultsAboveRepeat(
        id,
        newCount,
        Uid
      );
    }

    // Update the repeat count on a fresh (relationless) entity so saving does
    // not cascade back into analysisStandardResults. Going through .save()
    // fires the logging subscriber's afterUpdate.
    const head = await this.analysisStandardRepo.findOneBy({
      analysisStandardId: id,
    });
    head!.repeatCount = newCount;
    head!.updateUid = Uid;
    await this.analysisStandardRepo.save(head!);
  }

  async remove(id: number, userId: number) {
    // Load the entity and go through .remove() (not .delete(id)) so the
    // LoggingSubscriber.beforeRemove fires and stamps deleted_at on the audit
    // log. .delete(id) issues a raw DELETE that bypasses entity subscribers,
    // which previously left orphaned "active" log rows behind.
    const analysisStandard = await this.analysisStandardRepo.findOneBy({
      analysisStandardId: id,
    });
    if (!analysisStandard) {
      throw new NotFoundException('Analysis standard not found');
    }
    (analysisStandard as any).removedBy = userId;
    await this.analysisStandardRepo.remove(analysisStandard);
  }

  getLogs() {
    return this.analysisStandardLog.find();
  }
}
