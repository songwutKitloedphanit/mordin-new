import { IsNumber } from 'class-validator';

export class UpdateStandardCertificateValueFromFileDto {
  @IsNumber()
  standardId: number;

  @IsNumber()
  laboratoryId: number;

  @IsNumber()
  certificateValue: number;
}
