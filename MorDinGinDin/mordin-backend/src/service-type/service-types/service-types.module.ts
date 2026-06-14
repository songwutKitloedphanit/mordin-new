import { Module } from '@nestjs/common';
import { ServiceTypesService } from './service-types.service';
import { ServiceTypesController } from './service-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceType } from './entities/service-type.entity';
import { ServiceCategory } from '../service-categories/entities/service-category.entity';
import { ServiceLaboratory } from '../service-laboratories/entities/service-laboratory.entity';
import { Laboratory } from 'src/laboratory/laboratories/entities/laboratory.entity';
import { FertilizerMajor } from 'src/fertilizer/fertilizer-majors/entities/fertilizer-major.entity';
import { FertilizerMinor } from 'src/fertilizer/fertilizer-minors/entities/fertilizer-minor.entity';
import { ServiceFertilizerMinor } from 'src/fertilizer/service-fertilizer-minors/entities/service-fertilizer-minor.entity';
import { SoilGrade } from 'src/soil-grade/soil-grades/entities/soil-grade.entity';
import { SoilGradeLevel } from 'src/soil-grade/soil-grade-levels/entities/soil-grade-level.entity';
import { SoilGradesModule } from 'src/soil-grade/soil-grades/soil-grades.module';
import { SoilGradeLevelsModule } from 'src/soil-grade/soil-grade-levels/soil-grade-levels.module';
import { ServiceFertilizerMinorsModule } from 'src/fertilizer/service-fertilizer-minors/service-fertilizer-minors.module';
import { UsageType } from 'src/fertilizer/usage-types/entities/usage-type.entity';
import { ServiceFertilizerMajorUsage } from 'src/fertilizer/service-fertilizer-major-usages/entities/service-fertilizer-major-usage.entity';
import { ServiceFertilizerMajorUsagesModule } from 'src/fertilizer/service-fertilizer-major-usages/service-fertilizer-major-usages.module';
import { ResultGradesModule } from 'src/result-grade/result-grades/result-grades.module';
import { ResultGrade } from 'src/result-grade/result-grades/entities/result-grade.entity';
import { ServiceTypeLog } from './entities/service-type.log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ServiceType,
      ServiceCategory,
      ServiceLaboratory,
      Laboratory,
      FertilizerMajor,
      FertilizerMinor,
      ServiceFertilizerMinor,
      ServiceFertilizerMajorUsage,
      SoilGrade,
      SoilGradeLevel,
      UsageType,
      ResultGrade,
      ServiceFertilizerMinor,
      ServiceTypeLog
    ]),
    SoilGradesModule,
    SoilGradeLevelsModule,
    ServiceFertilizerMinorsModule,
    ServiceFertilizerMajorUsagesModule,
    ResultGradesModule
  ],
  controllers: [ServiceTypesController],
  providers: [ServiceTypesService],
})
export class ServiceTypesModule {}
