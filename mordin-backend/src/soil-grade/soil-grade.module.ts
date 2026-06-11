import { Module } from '@nestjs/common';

import { SoilGradeLevelsModule } from './soil-grade-levels/soil-grade-levels.module';

@Module({
  imports: [SoilGradeModule, SoilGradeLevelsModule],
})
export class SoilGradeModule {}
