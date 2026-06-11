import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Laboratory } from 'src/laboratory/laboratories/entities/laboratory.entity';
import { LaboratorySetting } from 'src/laboratory/laboratory-settings/entities/laboratory-setting.entity';
import { ResultGradeLevel } from 'src/result-grade/result-grade-levels/entities/result-grade-level.entity';
import { ResultGrade } from 'src/result-grade/result-grades/entities/result-grade.entity';
import { Book } from 'src/sample/books/entities/book.entity';
import { FertilizerMajorLandUsagesModule } from 'src/sample/fertilizer-major-land-usages/fertilizer-major-land-usages.module';
import { FertilizerMinorLandUsagesModule } from 'src/sample/fertilizer-minor-land-usages/fertilizer-minor-land-usages.module';
import { QrCode } from 'src/sample/qr-codes/entities/qr-code.entity';
import { Result } from 'src/sample/results/entities/result.entity';

import { CalculationService } from './calculation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Result,
      LaboratorySetting,
      Laboratory,
      Book,
      QrCode,
      ResultGrade,
      ResultGradeLevel,
    ]),
    FertilizerMinorLandUsagesModule,
    FertilizerMajorLandUsagesModule,
  ],
  providers: [CalculationService],
  exports: [CalculationService],
})
export class CalculationModule {}
