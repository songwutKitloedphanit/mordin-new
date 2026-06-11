import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ResultGradeLevel } from '../result-grade-levels/entities/result-grade-level.entity';

import { ResultGrade } from './entities/result-grade.entity';
import { ResultGradeLog } from './entities/result-grade.log.entity';
import { ResultGradesController } from './result-grades.controller';
import { ResultGradesService } from './result-grades.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ResultGrade, ResultGradeLevel, ResultGradeLog]),
  ],
  controllers: [ResultGradesController],
  providers: [ResultGradesService],
  exports: [ResultGradesService],
})
export class ResultGradesModule {}
