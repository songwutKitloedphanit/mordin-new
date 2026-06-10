import { Module } from '@nestjs/common';
import { SampleBlankResultsService } from './sample-blank-results.service';
import { SampleBlankResultsController } from './sample-blank-results.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SampleBlankResult } from './entities/sample-blank-result.entity';
import { SampleBlankResultLog } from './entities/sample-blank-result.log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SampleBlankResult , SampleBlankResultLog])],
  controllers: [SampleBlankResultsController],
  providers: [SampleBlankResultsService],
  exports: [SampleBlankResultsService],
})
export class SampleBlankResultsModule {}
