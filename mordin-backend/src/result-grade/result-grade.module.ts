import { Module } from '@nestjs/common';
import { ResultGradesModule } from './result-grades/result-grades.module';
import { ResultGradeLevelsModule } from './result-grade-levels/result-grade-levels.module';

@Module({
  imports: [ResultGradesModule, ResultGradeLevelsModule]
})
export class ResultGradeModule {}
