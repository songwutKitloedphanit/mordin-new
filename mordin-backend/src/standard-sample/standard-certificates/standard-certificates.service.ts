import { Injectable } from '@nestjs/common';
import { CreateStandardCertificateDto } from './dto/create-standard-certificate.dto';
import { UpdateStandardCertificateDto } from './dto/update-standard-certificate.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { StandardCertificate } from './entities/standard-certificate.entity';
import { In, Repository } from 'typeorm';
import { UpdateStandardCertificateValueFromFileDto } from './dto/update-standard-certificate-value-file.dto';
import * as Papa from 'papaparse';
import { Standard } from '../standards/entities/standard.entity';
import { Laboratory } from 'src/laboratory/laboratories/entities/laboratory.entity';
import { StandardCertificateLog } from './entities/standard-certificate.log.entity';

@Injectable()
export class StandardCertificatesService {
  constructor(
    @InjectRepository(StandardCertificate)
    private standardCertificateRepo: Repository<StandardCertificate>,
    @InjectRepository(Standard)
    private readonly standardRepo: Repository<Standard>,
    @InjectRepository(Laboratory)
    private readonly laboratoryRepo: Repository<Laboratory>,
    @InjectRepository(StandardCertificateLog)
    private standardCertificateLog: Repository<StandardCertificateLog>,
  ) { }

  create(createStandardCertificateDto: CreateStandardCertificateDto,Uid : number) {
    return 'This action adds a new standardCertificate';
  }

  findAll() {
    return `This action returns all standardCertificates`;
  }

  findOne(id: number) {
    return `This action returns a #${id} standardCertificate`;
  }
  async processCrmCsv(
    csvBuffer: Buffer
  ): Promise<{ updatedCount: number; errors: any[] }> {
    const text = csvBuffer.toString('utf8');
    const { data } = Papa.parse<{ sampleCode: string;[hdr: string]: string }>(text, {
      header: true,
      skipEmptyLines: true,
    });

    // load all Standards + all Labs
    const [allStd, allLab] = await Promise.all([
      this.standardRepo.find({ relations: ['standardCertificates'] }),
      this.laboratoryRepo.find(),
    ]);

    // build lookup maps
    const stdMap = new Map<string, number>();
    allStd.forEach(s => stdMap.set(s.standardName.toLowerCase(), s.standardId));

    const labMap = new Map<string, number>();
    allLab.forEach(l => {
      const key = `${l.shortNameBefore}|${l.unitBefore}`.toLowerCase();
      labMap.set(key, l.laboratoryId);
    });

    const inputs: UpdateStandardCertificateValueFromFileDto[] = [];
    const errors: any[] = [];

    data.forEach((row, i) => {
      const base = row.sampleCode!.split('/')[0].trim().toLowerCase();
      const stdId = stdMap.get(base);
      if (!stdId) {
        errors.push({ row: i + 2, sampleCode: row.sampleCode });
        return;
      }

      Object.entries(row).forEach(([hdr, cell]) => {
        if (hdr === 'sampleCode' || !cell) return;
        const m = hdr.match(/(.*)\s+\((.*)\)/);
        if (!m) return;
        const [, short, unit] = m;
        const labKey = `${short}|${unit}`.toLowerCase();
        const labId = labMap.get(labKey);
        if (!labId) {
          errors.push({ row: i + 2, header: hdr });
        } else {
          const v = parseFloat(cell);
          if (!isNaN(v)) {
            inputs.push({ standardId: stdId, laboratoryId: labId, certificateValue: v });
          }
        }
      });
    });

    if (errors.length) return { updatedCount: 0, errors };

    await this.updateCertificateValueFromFile(inputs);
    return { updatedCount: inputs.length, errors: [] };
  }

  async updateCertificateValueFromFile(inputs: UpdateStandardCertificateValueFromFileDto[]): Promise<void> {
    const map = new Map(
      inputs.map(i => [`${i.standardId}-${i.laboratoryId}`, i.certificateValue])
    );
    const keys = Array.from(map.keys());

    const [standardIds, laboratoryIds] = [
      inputs.map(i => i.standardId),
      inputs.map(i => i.laboratoryId),
    ];

    const entities = await this.standardCertificateRepo.find({
      where: {
        standardId: In(standardIds),
        laboratoryId: In(laboratoryIds),
      },
    });

    for (const entity of entities) {
      const key = `${entity.standardId}-${entity.laboratoryId}`;
      entity.certificateValue = map.get(key)!;
    }

    await this.standardCertificateRepo.save(entities);
  }


  remove(id: number) {
    return `This action removes a #${id} standardCertificate`;
  }
  getLogs() {
    return this.standardCertificateLog.find();
  }
}
