import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SampleBlankResult } from './entities/sample-blank-result.entity';
import { SampleBlankResultLog } from './entities/sample-blank-result.log.entity';
import { SampleBlankResultsController } from './sample-blank-results.controller';
import { SampleBlankResultsService } from './sample-blank-results.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SampleBlankResult, SampleBlankResultLog]),
  ],
  controllers: [SampleBlankResultsController],
  providers: [SampleBlankResultsService],
  exports: [SampleBlankResultsService],
})
export class SampleBlankResultsModule {}
