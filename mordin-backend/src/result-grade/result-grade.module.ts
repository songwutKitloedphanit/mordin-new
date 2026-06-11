import { Module } from '@nestjs/common';

import { ResultGradeLevelsModule } from './result-grade-levels/result-grade-levels.module';
import { ResultGradesModule } from './result-grades/result-grades.module';

@Module({
  imports: [ResultGradesModule, ResultGradeLevelsModule],
})
export class ResultGradeModule {}
