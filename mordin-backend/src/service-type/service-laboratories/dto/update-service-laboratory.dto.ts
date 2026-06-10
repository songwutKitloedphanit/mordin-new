import { PartialType } from '@nestjs/swagger';
import { CreateServiceLaboratoryDto } from './create-service-laboratory.dto';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class UpdateServiceLaboratoryDto extends PartialType(
  CreateServiceLaboratoryDto,
) {
  @IsNumber()
  serviceTypeId: number;

  @IsNumber()
  laboratoryId: number;

  @IsBoolean()
  isDisplay?: boolean;
}
