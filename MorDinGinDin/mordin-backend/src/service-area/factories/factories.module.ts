import { Module } from '@nestjs/common';
import { FactoriesService } from './factories.service';
import { FactoriesController } from './factories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Factory } from './entities/factory.entity';
import { ServiceArea } from '../service-areas/entities/service-area.entity';
import { FactoryLog } from './entities/factory.log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Factory, ServiceArea,FactoryLog])],
  controllers: [FactoriesController],
  providers: [FactoriesService],
})
export class FactoriesModule {}
