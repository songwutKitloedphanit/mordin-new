import { Module } from '@nestjs/common';
import { StandardsService } from './standards.service';
import { StandardsController } from './standards.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Standard } from './entities/standard.entity';
import { StandardCertificate } from '../standard-certificates/entities/standard-certificate.entity';
import { StandardLog } from './entities/standard.log.entity';
import { AnalysisStandard } from '../analysis-standards/entities/analysis-standard.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Standard,
      StandardCertificate,
      StandardLog,
      AnalysisStandard
    ])
  ],
  controllers: [StandardsController],
  providers: [StandardsService],
})
export class StandardsModule { }
