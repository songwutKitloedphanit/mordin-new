import { Module } from '@nestjs/common';
import { ServiceCalendarsService } from './service-calendars.service';
import { ServiceCalendarsController } from './service-calendars.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceCalendar } from './entities/service-calendar.entity';
import { Laboratory } from 'src/laboratory/laboratories/entities/laboratory.entity';
import { LaboratorySetting } from 'src/laboratory/laboratory-settings/entities/laboratory-setting.entity';
import { LaboratorySettingsModule } from 'src/laboratory/laboratory-settings/laboratory-settings.module';
import { HttpModule } from '@nestjs/axios';
import { Book } from 'src/sample/books/entities/book.entity';
import { ServiceCalendarLog } from './entities/service-calendar.log.entity';

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
