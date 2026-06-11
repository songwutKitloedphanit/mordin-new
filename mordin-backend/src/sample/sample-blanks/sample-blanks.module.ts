import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Laboratory } from 'src/laboratory/laboratories/entities/laboratory.entity';
import { LaboratorySetting } from 'src/laboratory/laboratory-settings/entities/laboratory-setting.entity';

import { SampleBlankResult } from '../sample-blank-results/entities/sample-blank-result.entity';
import { SampleBlankResultsModule } from '../sample-blank-results/sample-blank-results.module';

import { SampleBlank } from './entities/sample-blank.entity';
import { SampleBlankLog } from './entities/sample-blank.log.entity';
import { SampleBlanksController } from './sample-blanks.controller';
import { SampleBlanksService } from './sample-blanks.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      SampleBlank,
      SampleBlankLog,
      LaboratorySetting,
      Laboratory,
      SampleBlankResult,
    ]),
    SampleBlankResultsModule,
  ],
  controllers: [SampleBlanksController],
  providers: [SampleBlanksService],
})
export class SampleBlanksModule {}
