import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AnalysisStandard } from '../analysis-standards/entities/analysis-standard.entity';
import { StandardCertificate } from '../standard-certificates/entities/standard-certificate.entity';

import { CreateStandardDto } from './dto/create-standard.dto';
import { UpdateStandardDto } from './dto/update-standard.dto';
import { Standard } from './entities/standard.entity';
import { StandardLog } from './entities/standard.log.entity';

@Injectable()
export class StandardsService {
  constructor(
    @InjectRepository(Standard)
    private readonly standardRepo: Repository<Standard>,

    @InjectRepository(StandardCertificate)
    private readonly standardCerRepo: Repository<StandardCertificate>,
    @InjectRepository(StandardLog)
    private readonly standardLog: Repository<StandardLog>,

    @InjectRepository(AnalysisStandard)
    private readonly analysisStandardRepo: Repository<AnalysisStandard>
  ) {}

  async create(createStandardDto: CreateStandardDto, Uid: number) {
    const { standardName, standardCertificates } = createStandardDto;
    const standard = this.standardRepo.create({
      standardName,
      updatedUid: Uid,
    });
    const savedStandard = await this.standardRepo.save(standard);
    if (!savedStandard) throw new Error('Failed to save standard');

    for (const cert of standardCertificates) {
      const standardCertificate = this.standardCerRepo.create({
        ...cert,
        standardId: savedStandard.standardId,
      });
      const savedStandardCertificate =
        await this.standardCerRepo.save(standardCertificate);
      if (!savedStandardCertificate)
        throw new Error('Failed to save standard certificate');
    }
    return await this.standardRepo.findOne({
      where: { standardId: savedStandard.standardId },
      relations: ['standardCertificates', 'standardCertificates.laboratory'],
    });
  }

  findAll() {
    return this.standardRepo.find({
      relations: ['standardCertificates', 'standardCertificates.laboratory'],
      order: { standardId: 'ASC' },
    });
  }

  findOne(id: number) {
    return this.standardRepo.findOne({
      where: { standardId: id },
      relations: ['standardCertificates', 'standardCertificates.laboratory'],
    });
  }

  async update(id: number, updateStandardDto: UpdateStandardDto, Uid: number) {
    const { standardName, standardCertificates } = updateStandardDto;
    const standard = await this.standardRepo.findOne({
      where: { standardId: id },
    });
    if (!standard) throw new Error(`Standard with ID ${id} not found`);
    standard.standardName = standardName;
    standard.updatedUid = Uid;
    const savedStandard = await this.standardRepo.save(standard);
    // Remove existing standard certificates
    await this.standardCerRepo.delete({ standardId: id });

    // Create new standard certificates
    for (const cert of standardCertificates) {
      const standardCertificate = this.standardCerRepo.create({
        ...cert,
        standardId: id,
      });
      const savedStandardCertificate =
        await this.standardCerRepo.save(standardCertificate);
      if (!savedStandardCertificate)
        throw new Error('Failed to save standard certificate');
    }
    return await this.standardRepo.findOne({
      where: { standardId: savedStandard.standardId },
      relations: ['standardCertificates', 'standardCertificates.laboratory'],
    });
  }

  async remove(id: number): Promise<void> {
    const userId = 99; // mock
    // 1. ค้นหา Entity ที่ต้องการลบ
    const standard = await this.standardRepo.findOneBy({ standardId: id });
    if (!standard) {
      throw new NotFoundException('standard not found');
    }

    // Check if standard is used in analysis
    const usedInAnalysis = await this.analysisStandardRepo.count({
      where: { standardId: id },
    });
    if (usedInAnalysis > 0) {
      throw new BadRequestException(
        'Standard นี้มีการนำไปใช้เทียบค่าในการทดลองแล้ว'
      );
    }

    // 2. แนบ userId เข้าไปใน property ที่เรานิยามไว้ใน .d.ts
    (standard as any).removedBy = userId;

    // 3. ส่ง Entity object ที่แก้ไขแล้วไปให้ .remove()
    await this.standardRepo.remove(standard);
  }

  getLogs() {
    return this.standardLog.find();
  }
}
