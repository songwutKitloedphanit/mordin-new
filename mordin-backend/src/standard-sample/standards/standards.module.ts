import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AnalysisStandard } from '../analysis-standards/entities/analysis-standard.entity';
import { StandardCertificate } from '../standard-certificates/entities/standard-certificate.entity';

import { Standard } from './entities/standard.entity';
import { StandardLog } from './entities/standard.log.entity';
import { StandardsController } from './standards.controller';
import { StandardsService } from './standards.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Standard,
      StandardCertificate,
      StandardLog,
      AnalysisStandard,
    ]),
  ],
  controllers: [StandardsController],
  providers: [StandardsService],
})
export class StandardsModule {}
