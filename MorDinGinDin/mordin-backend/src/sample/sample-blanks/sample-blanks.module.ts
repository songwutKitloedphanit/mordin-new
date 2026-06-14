import { Module } from '@nestjs/common';
import { SampleBlanksService } from './sample-blanks.service';
import { SampleBlanksController } from './sample-blanks.controller';
import { SampleBlank } from './entities/sample-blank.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SampleBlankResultsModule } from '../sample-blank-results/sample-blank-results.module';
import { LaboratorySetting } from 'src/laboratory/laboratory-settings/entities/laboratory-setting.entity';
import { Laboratory } from 'src/laboratory/laboratories/entities/laboratory.entity';
import { SampleBlankResult } from '../sample-blank-results/entities/sample-blank-result.entity';
import { SampleBlankLog } from './entities/sample-blank.log.entity';
@Module({
  imports: [TypeOrmModule.forFeature([
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
export class SampleBlanksModule { }
