import { Module } from '@nestjs/common';
import { UnitsService } from './units.service';
import { UnitsController } from './units.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Unit } from './entities/unit.entity';
import { UnitLog } from './entities/unit.log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Unit,UnitLog])],
  controllers: [UnitsController],
  providers: [UnitsService],
})
export class UnitsModule {}
