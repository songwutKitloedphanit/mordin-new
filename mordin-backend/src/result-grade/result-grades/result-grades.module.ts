import { Module } from '@nestjs/common';
import { ResultGradesService } from './result-grades.service';
import { ResultGradesController } from './result-grades.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResultGrade } from './entities/result-grade.entity';
import { ResultGradeLevel } from '../result-grade-levels/entities/result-grade-level.entity';
import { ResultGradeLog } from './entities/result-grade.log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ResultGrade,
      ResultGradeLevel,
      ResultGradeLog
    ])
  ],
  controllers: [ResultGradesController],
  providers: [ResultGradesService],
  exports: [ResultGradesService]
})
export class ResultGradesModule {}
