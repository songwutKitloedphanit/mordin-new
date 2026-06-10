import { IsNumber } from 'class-validator';

export class UpdateAnalysisStandardResultFromFileDto {
  @IsNumber()
  analysisStandardResultId: number;

  @IsNumber()
  preValue: number;
}
