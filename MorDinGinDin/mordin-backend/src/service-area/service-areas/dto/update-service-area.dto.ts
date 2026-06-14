import { PartialType } from '@nestjs/swagger';
import { CreateServiceAreaDto } from './create-service-area.dto';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateServiceAreaDto extends PartialType(CreateServiceAreaDto) {
  @IsNotEmpty()
  @IsNumber()
  serviceAreaId: number;
}
