import { Module } from '@nestjs/common';
import { StandardsModule } from './standards/standards.module';
import { StandardCertificatesModule } from './standard-certificates/standard-certificates.module';
import { AnalysisStandardsModule } from './analysis-standards/analysis-standards.module';
import { AnalysisStandardResultsModule } from './analysis-standard-results/analysis-standard-results.module';

@Module({
  imports: [StandardsModule, StandardCertificatesModule, AnalysisStandardsModule, AnalysisStandardResultsModule]
})
export class StandardSampleModule {}
