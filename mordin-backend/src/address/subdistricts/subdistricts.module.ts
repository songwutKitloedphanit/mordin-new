import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Subdistrict } from './entities/subdistrict.entity';
import { SubdistrictsController } from './subdistricts.controller';
import { SubdistrictsService } from './subdistricts.service';

@Module({
  imports: [TypeOrmModule.forFeature([Subdistrict])],
  controllers: [SubdistrictsController],
  providers: [SubdistrictsService],
})
export class SubdistrictsModule {}
