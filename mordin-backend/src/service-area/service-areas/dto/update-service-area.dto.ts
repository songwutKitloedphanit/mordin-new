import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

import { CreateServiceAreaDto } from './create-service-area.dto';

export class UpdateServiceAreaDto extends PartialType(CreateServiceAreaDto) {
  @IsNotEmpty()
  @IsNumber()
  serviceAreaId: number;
}
