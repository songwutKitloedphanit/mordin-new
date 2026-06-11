import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BusesController } from './buses.controller';
import { BusesService } from './buses.service';
import { Bus } from './entities/bus.entity';
import { BusLog } from './entities/bus.log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bus, BusLog])],
  controllers: [BusesController],
  providers: [BusesService],
})
export class BusesModule {}
