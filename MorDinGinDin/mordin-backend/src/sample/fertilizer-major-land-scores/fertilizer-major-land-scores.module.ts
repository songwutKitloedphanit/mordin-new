import { Module } from '@nestjs/common';
import { FertilizerMajorLandScoresService } from './fertilizer-major-land-scores.service';
import { FertilizerMajorLandScoresController } from './fertilizer-major-land-scores.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FertilizerMajorLandScore } from './entities/fertilizer-major-land-score.entity';
import { FertilizerMajorLandScoreLog } from './entities/fertilizer-major-land-score.log.entity';
import { Result } from '../results/entities/result.entity';

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
