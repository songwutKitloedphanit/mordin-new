import { Module } from '@nestjs/common';
import { UsageTypesService } from './usage-types.service';
import { UsageTypesController } from './usage-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsageType } from './entities/usage-type.entity';
import { UsageTypeLog } from './entities/usage-type.log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UsageType,UsageTypeLog])],
  controllers: [UsageTypesController],
  providers: [UsageTypesService],
})
export class UsageTypesModule {}
