import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ResultGradeLevel } from './entities/result-grade-level.entity';
import { ResultGradeLevelLog } from './entities/result-grade-level.log.entity';
import { ResultGradeLevelsController } from './result-grade-levels.controller';
import { ResultGradeLevelsService } from './result-grade-levels.service';

@Module({
  imports: [TypeOrmModule.forFeature([ResultGradeLevel, ResultGradeLevelLog])],
  controllers: [ResultGradeLevelsController],
  providers: [ResultGradeLevelsService],
})
export class ResultGradeLevelsModule {}
