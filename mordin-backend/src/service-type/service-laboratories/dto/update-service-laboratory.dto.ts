import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsNumber } from 'class-validator';

import { CreateServiceLaboratoryDto } from './create-service-laboratory.dto';

export class UpdateServiceLaboratoryDto extends PartialType(
  CreateServiceLaboratoryDto
) {
  @IsNumber()
  serviceTypeId: number;

  @IsNumber()
  laboratoryId: number;

  @IsBoolean()
  isDisplay?: boolean;
}
