import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSampleBlankDto } from './dto/create-sample-blank.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SampleBlank } from './entities/sample-blank.entity';
import { Repository } from 'typeorm';
import { Laboratory } from 'src/laboratory/laboratories/entities/laboratory.entity';
import { LaboratorySetting } from 'src/laboratory/laboratory-settings/entities/laboratory-setting.entity';
import { RecordTypeEnum } from '../enums/recode-type.enum';
import { SampleBlankResultsService } from '../sample-blank-results/sample-blank-results.service';
import { UpdateSampleBlankDto } from './dto/update-sample-blank.dto';
import { CreateSampleBlankResultDto } from '../sample-blank-results/dto/create-sample-blank-result.dto';
import { UpdateSampleBlankResultDto } from '../sample-blank-results/dto/update-sample-blank-result.dto';
import { SampleBlankLog } from './entities/sample-blank.log.entity';
@Injectable()
export class SampleBlanksService {
  constructor(
    @InjectRepository(SampleBlank)
    private sampleBlankRepo: Repository<SampleBlank>,

    @InjectRepository(SampleBlankLog)
    private sampleBlankLog: Repository<SampleBlankLog>,

    @InjectRepository(Laboratory)
    private laboratoryRepo: Repository<Laboratory>,

    @InjectRepository(LaboratorySetting)
    private laboratorySettingRepo: Repository<LaboratorySetting>,

    private readonly sampleBlankResultService: SampleBlankResultsService
  ) { }

  async create(createDto: CreateSampleBlankDto, Uid: number) {
    const { sampleBlankResult, ...blankData } = createDto;

    const created = await this.sampleBlankRepo.save(
      this.sampleBlankRepo.create({
        ...blankData,
        updateUid: Uid,
      }),
    );

    if (sampleBlankResult?.length) {
      await Promise.all(
        sampleBlankResult.map((dto) =>
          this.sampleBlankResultService.createBySampleBlank(
            created.sampleBlankId,
            dto,
          ),
        ),
      );
    }

    return this.findOne(created.sampleBlankId);
  }

  /** ดึงทั้งหมด */
  findAll() {
    return this.sampleBlankRepo.find({
      relations: {
        sampleBlankResult: { laboratorySetting: { laboratory: true } },
        serviceCalendar: true,
      },
    });
  }

  /** ดึงรายการเดียว */
  findOne(id: number) {
    return this.sampleBlankRepo.findOne({
      where: { sampleBlankId: id },
      relations: {
        sampleBlankResult: { laboratorySetting: { laboratory: true } },
        serviceCalendar: true,
      },
    });
  }

  async update(id: number, dto: UpdateSampleBlankDto, Uid: number) {
    const exists = await this.sampleBlankRepo.findOne({ where: { sampleBlankId: id } });
    if (!exists) throw new NotFoundException(`SampleBlank id=${id} not found`);

    await this.sampleBlankRepo.update(id, {
      name: dto.name,
      repeatCount: dto.repeatCount,
      type: dto.type,
      updateUid: Uid,
    });
    await Promise.all(
      dto.sampleBlankResult.map((r) =>
        this.sampleBlankResultService.update(
          r.sampleBlankResultId!,
          r,
          Uid
        )
      ),
    );
    return this.findOne(id);
  }


  remove(id: number) {
    return `This action removes a #${id} sampleBlank`;
  }

  getLogs() {
    return this.sampleBlankLog.find();
  }
}
