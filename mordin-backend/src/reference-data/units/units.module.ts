import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Unit } from './entities/unit.entity';
import { UnitLog } from './entities/unit.log.entity';
import { UnitsController } from './units.controller';
import { UnitsService } from './units.service';

@Module({
  imports: [TypeOrmModule.forFeature([Unit, UnitLog])],
  controllers: [UnitsController],
  providers: [UnitsService],
})
export class UnitsModule {}
