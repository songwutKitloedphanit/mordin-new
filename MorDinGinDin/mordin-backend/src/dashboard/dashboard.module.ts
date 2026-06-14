import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceCalendar } from 'src/service-calendars/entities/service-calendar.entity';
import { Book } from 'src/sample/books/entities/book.entity';
import { Farmer } from 'src/farmers/entities/farmer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ServiceCalendar,
      Book,
      Farmer
    ])
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}