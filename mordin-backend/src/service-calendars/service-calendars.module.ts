import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Laboratory } from 'src/laboratory/laboratories/entities/laboratory.entity';
import { LaboratorySetting } from 'src/laboratory/laboratory-settings/entities/laboratory-setting.entity';
import { LaboratorySettingsModule } from 'src/laboratory/laboratory-settings/laboratory-settings.module';
import { Book } from 'src/sample/books/entities/book.entity';

import { ServiceCalendar } from './entities/service-calendar.entity';
import { ServiceCalendarLog } from './entities/service-calendar.log.entity';
import { ServiceCalendarsController } from './service-calendars.controller';
import { ServiceCalendarsService } from './service-calendars.service';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      ServiceCalendar,
      Laboratory,
      LaboratorySetting,
      Book,
      ServiceCalendarLog,
    ]),
    LaboratorySettingsModule,
  ],
  controllers: [ServiceCalendarsController],
  providers: [ServiceCalendarsService],
})
export class ServiceCalendarsModule {}
