import { Module } from '@nestjs/common';
import { SoilGradesService } from './soil-grades.service';
import { SoilGradesController } from './soil-grades.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SoilGrade } from './entities/soil-grade.entity';
import { SoilGradeLevel } from '../soil-grade-levels/entities/soil-grade-level.entity';
import { SoilGradeLevelsModule } from '../soil-grade-levels/soil-grade-levels.module';
import { Laboratory } from 'src/laboratory/laboratories/entities/laboratory.entity';
import { SoilGradeLog } from './entities/soil-grade.log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SoilGrade, SoilGradeLevel, Laboratory,SoilGradeLog]),
    SoilGradeLevelsModule,
  ],
  controllers: [SoilGradesController],
  providers: [SoilGradesService],
  exports: [SoilGradesService],
})
export class SoilGradesModule {}
