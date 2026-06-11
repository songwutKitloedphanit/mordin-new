import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Geography } from './entities/geography.entity';
import { GeographiesController } from './geographies.controller';
import { GeographiesService } from './geographies.service';

@Module({
  imports: [TypeOrmModule.forFeature([Geography])],
  controllers: [GeographiesController],
  providers: [GeographiesService],
})
export class GeographiesModule {}
