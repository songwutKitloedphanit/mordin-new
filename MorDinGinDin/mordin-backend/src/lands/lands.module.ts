/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { LandsService } from './lands.service';
import { LandsController } from './lands.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Land } from './entities/land.entity';
import { FertilizerMajorLandScore } from 'src/sample/fertilizer-major-land-scores/entities/fertilizer-major-land-score.entity';
import { Book } from 'src/sample/books/entities/book.entity';
import { LandLog } from './entities/land.log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Land,
    LandLog, 
    FertilizerMajorLandScore,
    Book
  ])],
  controllers: [LandsController],
  providers: [LandsService],
})
export class LandsModule { }
