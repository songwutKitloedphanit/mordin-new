import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SoilGrade } from '../soil-grades/entities/soil-grade.entity';

import { SoilGradeLevel } from './entities/soil-grade-level.entity';
import { SoilGradeLevelLog } from './entities/soil-grade-level.log.entity';
import { SoilGradeLevelsController } from './soil-grade-levels.controller';
import { SoilGradeLevelsService } from './soil-grade-levels.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SoilGradeLevel, SoilGrade, SoilGradeLevelLog]),
  ],
  controllers: [SoilGradeLevelsController],
  providers: [SoilGradeLevelsService],
  exports: [SoilGradeLevelsService],
})
export class SoilGradeLevelsModule {}
