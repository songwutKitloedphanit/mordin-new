/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Farmer } from 'src/farmers/entities/farmer.entity';
import { Book } from 'src/sample/books/entities/book.entity';
import { FertilizerMajorLandScore } from 'src/sample/fertilizer-major-land-scores/entities/fertilizer-major-land-score.entity';

import { Land } from './entities/land.entity';
import { LandLog } from './entities/land.log.entity';
import { LandsController } from './lands.controller';
import { LandsService } from './lands.service';

@Module({
  imports: [TypeOrmModule.forFeature([
    Land,
    LandLog, 
    Farmer,
    FertilizerMajorLandScore,
    Book
  ])],
  controllers: [LandsController],
  providers: [LandsService],
})
export class LandsModule { }
