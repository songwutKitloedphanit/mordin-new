import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Result } from '../results/entities/result.entity';

import { FertilizerMajorLandScore } from './entities/fertilizer-major-land-score.entity';
import { FertilizerMajorLandScoreLog } from './entities/fertilizer-major-land-score.log.entity';
import { FertilizerMajorLandScoresController } from './fertilizer-major-land-scores.controller';
import { FertilizerMajorLandScoresService } from './fertilizer-major-land-scores.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FertilizerMajorLandScore,
      FertilizerMajorLandScoreLog,
      Result,
    ]),
  ],
  controllers: [FertilizerMajorLandScoresController],
  providers: [FertilizerMajorLandScoresService],
})
export class FertilizerMajorLandScoresModule {}
