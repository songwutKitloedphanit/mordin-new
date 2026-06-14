import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class UpdateAnalysisStandardRepeatDto {
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  repeatCount: number;
}
