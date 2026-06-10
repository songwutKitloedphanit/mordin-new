import { Module } from '@nestjs/common';
import { BooksModule } from './books/books.module';
import { QrCodesModule } from './qr-codes/qr-codes.module';
import { QrCodeLabsModule } from './qr-code-labs/qr-code-labs.module';
import { ResultsModule } from './results/results.module';
import { SampleBlanksModule } from './sample-blanks/sample-blanks.module';
import { SampleBlankResultsModule } from './sample-blank-results/sample-blank-results.module';
import { FertilizerMinorLandUsagesModule } from './fertilizer-minor-land-usages/fertilizer-minor-land-usages.module';
import { FertilizerMajorLandUsagesModule } from './fertilizer-major-land-usages/fertilizer-major-land-usages.module';
import { FertilizerMajorLandScoresModule } from './fertilizer-major-land-scores/fertilizer-major-land-scores.module';

@Module({
  imports: [
    BooksModule,
    QrCodesModule,
    QrCodeLabsModule,
    ResultsModule,
    SampleBlanksModule,
    SampleBlankResultsModule,
    FertilizerMinorLandUsagesModule,
    FertilizerMajorLandUsagesModule,
    FertilizerMajorLandScoresModule,
  ],
})
export class SampleModule {}
