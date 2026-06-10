import { Module } from '@nestjs/common';
import { MachineTypesService } from './machine-types.service';
import { MachineTypesController } from './machine-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MachineType } from './entities/machine-type.entity';
import { MachineTypeLog } from './entities/machine-type.log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MachineType,MachineTypeLog])],
  controllers: [MachineTypesController],
  providers: [MachineTypesService],
})
export class MachineTypesModule {}
