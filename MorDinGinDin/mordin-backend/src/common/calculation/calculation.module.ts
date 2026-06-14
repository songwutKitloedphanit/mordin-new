import { Module, Res } from '@nestjs/common';
import { CalculationService } from './calculation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Result } from 'src/sample/results/entities/result.entity';
import { LaboratorySetting } from 'src/laboratory/laboratory-settings/entities/laboratory-setting.entity';
import { Laboratory } from 'src/laboratory/laboratories/entities/laboratory.entity';
import { Book } from 'src/sample/books/entities/book.entity';
import { QrCode } from 'src/sample/qr-codes/entities/qr-code.entity';
import { ResultGrade } from 'src/result-grade/result-grades/entities/result-grade.entity';
import { ResultGradeLevel } from 'src/result-grade/result-grade-levels/entities/result-grade-level.entity';
import { FertilizerMinorLandUsagesModule } from 'src/sample/fertilizer-minor-land-usages/fertilizer-minor-land-usages.module';
import { FertilizerMajorLandUsagesModule } from 'src/sample/fertilizer-major-land-usages/fertilizer-major-land-usages.module';

@Module({
  imports: [TypeOrmModule.forFeature([
    Result,
    LaboratorySetting,
    Laboratory,
    Book,
    QrCode,
    ResultGrade,
    ResultGradeLevel
  ]),
  FertilizerMinorLandUsagesModule,
  FertilizerMajorLandUsagesModule,
],
  providers: [CalculationService],
  exports: [CalculationService]
})
export class CalculationModule { }
