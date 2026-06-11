import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as Papa from 'papaparse';
import { LaboratorySetting } from 'src/laboratory/laboratory-settings/entities/laboratory-setting.entity';
import { RecordTypeEnum } from 'src/sample/enums/recode-type.enum';
import { Repository, In } from 'typeorm';

import {
  AnalysisStandard,
  StandardType,
} from '../analysis-standards/entities/analysis-standard.entity';
import { Standard } from '../standards/entities/standard.entity';

import { UpdateAnalysisStandardResultFromFileDto } from './dto/update-analysis-standard-result-file.dto';
import { AnalysisStandardResult } from './entities/analysis-standard-result.entity';
import { AnalysisStandardResultLog } from './entities/analysis-standard-result.log.entity';
import { StandardCalculationService } from './standard-calculation.service';
@Injectable()
export class AnalysisStandardResultsService {
  constructor(
    @InjectRepository(AnalysisStandardResult)
    private analysisStandardResultRepo: Repository<AnalysisStandardResult>,

    @InjectRepository(LaboratorySetting)
    private laboratorySettingRepo: Repository<LaboratorySetting>,

    @InjectRepository(AnalysisStandard)
    private analysisStandardRepo: Repository<AnalysisStandard>,

    @InjectRepository(Standard)
    private standardRepo: Repository<Standard>,
    @InjectRepository(AnalysisStandardResultLog)
    private readonly analysisStandardResultLog: Repository<AnalysisStandardResultLog>,
    private readonly standardCalculationService: StandardCalculationService
  ) {}

  async createWithAnalysisStandard(analysisStandard: AnalysisStandard) {
    if (analysisStandard.type === StandardType.CRM) {
      const laboratorySetting = await this.laboratorySettingRepo.find({
        where: { serviceCalendarId: analysisStandard.serviceCalendarId },
      });
      if (!laboratorySetting || laboratorySetting.length === 0) {
        throw new NotFoundException(
          'Laboratory setting not found for the given service calendar'
        );
      }
      const standard = await this.standardRepo.findOne({
        where: { standardId: analysisStandard.standardId },
        relations: {
          standardCertificates: true,
        },
      });
      if (!standard) {
        throw new NotFoundException('Standard not found');
      }
      for (const certificate of standard.standardCertificates) {
        const matchLabSetting = laboratorySetting.find(
          lab => lab.laboratoryId === certificate.laboratoryId
        );
        if (matchLabSetting) {
          // Create a new AnalysisStandardResult for each certificate
          for (let i = 1; i <= analysisStandard.repeatCount; i++) {
            const analysisStandardResult =
              this.analysisStandardResultRepo.create({
                analysisStandardId: analysisStandard.analysisStandardId,
                laboratorySettingId: matchLabSetting.laboratorySettingId,
                laboratoryId: matchLabSetting.laboratoryId,
                repeatNumber: i,
              });
            await this.analysisStandardResultRepo.save(analysisStandardResult);
          }
        }
      }
    } else if (analysisStandard.type === StandardType.BLANK) {
      const laboratorySetting = await this.laboratorySettingRepo.find({
        where: { serviceCalendarId: analysisStandard.serviceCalendarId },
      });
      if (!laboratorySetting || laboratorySetting.length === 0) {
        throw new NotFoundException(
          'Laboratory setting not found for the given service calendar'
        );
      }
      for (const labSetting of laboratorySetting) {
        for (let i = 1; i <= analysisStandard.repeatCount; i++) {
          const analysisStandardResult = this.analysisStandardResultRepo.create(
            {
              analysisStandardId: analysisStandard.analysisStandardId,
              laboratorySettingId: labSetting.laboratorySettingId,
              laboratoryId: labSetting.laboratoryId,
              repeatNumber: i,
            }
          );
          await this.analysisStandardResultRepo.save(analysisStandardResult);
        }
      }
    }
  }

  async processBlankCsv(
    csvBuffer: Buffer,
    serviceCalendarId: number
  ): Promise<{ updatedCount: number; errors: any[] }> {
    const text = csvBuffer.toString('utf8');
    const { data } = Papa.parse<{ sampleCode: string; [hdr: string]: string }>(
      text,
      {
        header: true,
        skipEmptyLines: true,
      }
    );

    // 1) fetch all AnalysisStandards for this calendar, with their results:
    const all = await this.analysisStandardRepo.find({
      where: { serviceCalendarId },
      relations: [
        'analysisStandardResults',
        'analysisStandardResults.laboratorySetting',
        'analysisStandardResults.laboratorySetting.laboratory',
      ],
    });

    // 2) build lookup map < "name/repeat|short|unit" → resultId >
    const map = new Map<string, number>();
    all.forEach(std => {
      std.analysisStandardResults.forEach(r => {
        const lab = r.laboratorySetting.laboratory;
        const key =
          `${std.name}/${r.repeatNumber}|${lab.shortNameBefore}|${lab.unitBefore}`.toLowerCase();
        map.set(key, r.analysisStandardResultId);
      });
    });

    const inputs: { analysisStandardResultId: number; preValue: number }[] = [];
    const errors: any[] = [];

    // 3) walk CSV rows
    data.forEach((row, i) => {
      const code = row.sampleCode!.trim(); // e.g. "Blank-1/2"
      Object.entries(row).forEach(([hdr, cell]) => {
        if (hdr === 'sampleCode' || !cell) return;
        const m = hdr.match(/(.*)\s+\((.*)\)/);
        if (!m) return;
        const [, short, unit] = m;
        const key = `${code}|${short.trim()}|${unit.trim()}`.toLowerCase();
        const id = map.get(key);
        if (!id) {
          errors.push({ row: i + 2, sampleCode: code, header: hdr });
        } else {
          const v = parseFloat(cell);
          if (!isNaN(v)) {
            inputs.push({ analysisStandardResultId: id, preValue: v });
          }
        }
      });
    });

    if (errors.length) return { updatedCount: 0, errors };

    // 4) do the bulk update
    await this.updatePreValueFromFile(inputs);
    return { updatedCount: inputs.length, errors: [] };
  }

  async processCrmResultCsv(
    csvBuffer: Buffer,
    serviceCalendarId: number
  ): Promise<{ updatedCount: number; errors: any[] }> {
    const text = csvBuffer.toString('utf8');
    const { data } = Papa.parse<{ sampleCode: string; [hdr: string]: string }>(
      text,
      {
        header: true,
        skipEmptyLines: true,
      }
    );

    // 1) fetch all AnalysisStandards for this calendar (type CRM)
    const all = await this.analysisStandardRepo.find({
      where: {
        serviceCalendarId,
        type: StandardType.CRM,
      },
      relations: [
        'analysisStandardResults',
        'analysisStandardResults.laboratorySetting',
        'analysisStandardResults.laboratorySetting.laboratory',
      ],
    });

    // 2) build lookup map < "name/repeat|short|unit" → resultId >
    // Note: CRM standard name might be "CRM-Low" or similar.
    // The key construction logic must match how sampleCode is formatted in the CSV.
    const map = new Map<string, number>();
    all.forEach(std => {
      std.analysisStandardResults.forEach(r => {
        const lab = r.laboratorySetting.laboratory;
        const key =
          `${std.name}/${r.repeatNumber}|${lab.shortNameBefore}|${lab.unitBefore}`.toLowerCase();
        map.set(key, r.analysisStandardResultId);
      });
    });

    const inputs: UpdateAnalysisStandardResultFromFileDto[] = [];
    const errors: any[] = [];

    // 3) walk CSV rows
    data.forEach((row, i) => {
      const code = row.sampleCode!.trim(); // e.g. "CRM-Low/1"
      Object.entries(row).forEach(([hdr, cell]) => {
        if (hdr === 'sampleCode' || !cell) return;
        const m = hdr.match(/(.*)\s+\((.*)\)/);
        if (!m) return;
        const [, short, unit] = m;
        const key = `${code}|${short.trim()}|${unit.trim()}`.toLowerCase();
        const id = map.get(key);
        if (!id) {
          errors.push({ row: i + 2, sampleCode: code, header: hdr });
        } else {
          const v = parseFloat(cell);
          if (!isNaN(v)) {
            inputs.push({ analysisStandardResultId: id, preValue: v });
          }
        }
      });
    });

    if (errors.length) return { updatedCount: 0, errors };

    // 4) do the bulk update
    await this.updatePreValueFromFile(inputs);
    return { updatedCount: inputs.length, errors: [] };
  }

  async updatePreValueFromInput(
    inputs: UpdateAnalysisStandardResultFromFileDto[],
    uid: number
  ): Promise<void> {
    const ids = inputs.map(i => i.analysisStandardResultId);
    const map = new Map(
      inputs.map(i => [i.analysisStandardResultId, i.preValue])
    );

    const entities = await this.analysisStandardResultRepo.find({
      where: { analysisStandardResultId: In(ids) },
      relations: {
        laboratorySetting: {
          laboratory: {
            machineType: true,
          },
        },
      },
    });

    if (entities.length !== ids.length) {
      throw new NotFoundException('Some standard results not found.');
    }

    for (const entity of entities) {
      entity.preValue = map.get(entity.analysisStandardResultId)!;
      entity.recordedAt = Date.now();
      entity.recordedUid = uid;
      entity.recordedType = RecordTypeEnum.INPUT;
    }

    // Calculate Results (which includes saving)
    await this.standardCalculationService.calculateResults(entities);
  }

  async updatePreValueFromFile(
    inputs: UpdateAnalysisStandardResultFromFileDto[]
  ): Promise<void> {
    const mockUid = 1;
    const ids = inputs.map(i => i.analysisStandardResultId);
    const map = new Map(
      inputs.map(i => [i.analysisStandardResultId, i.preValue])
    );

    const entities = await this.analysisStandardResultRepo.find({
      where: { analysisStandardResultId: In(ids) },
      relations: {
        laboratorySetting: {
          laboratory: {
            machineType: true,
          },
        },
      },
    });

    if (entities.length !== ids.length) {
      throw new NotFoundException('Some standard results not found.');
    }

    for (const entity of entities) {
      entity.preValue = map.get(entity.analysisStandardResultId)!;
      entity.recordedAt = Date.now();
      entity.recordedUid = mockUid;
      entity.recordedType = RecordTypeEnum.FILE;
    }

    // await this.analysisStandardResultRepo.save(entities);
    // [UPDATED] Calculate Results (which includes saving)
    await this.standardCalculationService.calculateResults(entities);
  }

  getLogs() {
    return this.analysisStandardResultLog.find();
  }
}
