import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsageType } from './entities/usage-type.entity';
import { UsageTypeLog } from './entities/usage-type.log.entity';
import { UsageTypesController } from './usage-types.controller';
import { UsageTypesService } from './usage-types.service';

@Module({
  imports: [TypeOrmModule.forFeature([UsageType, UsageTypeLog])],
  controllers: [UsageTypesController],
  providers: [UsageTypesService],
})
export class UsageTypesModule {}
