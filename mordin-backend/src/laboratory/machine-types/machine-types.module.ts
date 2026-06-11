import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MachineType } from './entities/machine-type.entity';
import { MachineTypeLog } from './entities/machine-type.log.entity';
import { MachineTypesController } from './machine-types.controller';
import { MachineTypesService } from './machine-types.service';

@Module({
  imports: [TypeOrmModule.forFeature([MachineType, MachineTypeLog])],
  controllers: [MachineTypesController],
  providers: [MachineTypesService],
})
export class MachineTypesModule {}
