import { PartialType } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import { CreateUnitDto } from './create-unit.dto';

export class UpdateUnitDto extends PartialType(CreateUnitDto) {
  @IsString()
  name: string;

  @IsString()
  initial: string;
}
