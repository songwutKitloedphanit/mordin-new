import { Module } from '@nestjs/common';
import { SoilGradeLevelsService } from './soil-grade-levels.service';
import { SoilGradeLevelsController } from './soil-grade-levels.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SoilGradeLevel } from './entities/soil-grade-level.entity';
import { SoilGrade } from '../soil-grades/entities/soil-grade.entity';
import { SoilGradeLevelLog } from './entities/soil-grade-level.log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SoilGradeLevel, SoilGrade, SoilGradeLevelLog]),
  ],
  controllers: [SoilGradeLevelsController],
  providers: [SoilGradeLevelsService],
  exports: [SoilGradeLevelsService],
})
export class SoilGradeLevelsModule {}
