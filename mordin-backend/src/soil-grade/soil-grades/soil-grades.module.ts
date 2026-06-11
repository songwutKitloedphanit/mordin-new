import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Laboratory } from 'src/laboratory/laboratories/entities/laboratory.entity';

import { SoilGradeLevel } from '../soil-grade-levels/entities/soil-grade-level.entity';
import { SoilGradeLevelsModule } from '../soil-grade-levels/soil-grade-levels.module';

import { SoilGrade } from './entities/soil-grade.entity';
import { SoilGradeLog } from './entities/soil-grade.log.entity';
import { SoilGradesController } from './soil-grades.controller';
import { SoilGradesService } from './soil-grades.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SoilGrade,
      SoilGradeLevel,
      Laboratory,
      SoilGradeLog,
    ]),
    SoilGradeLevelsModule,
  ],
  controllers: [SoilGradesController],
  providers: [SoilGradesService],
  exports: [SoilGradesService],
})
export class SoilGradesModule {}
