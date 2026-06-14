import { PartialType } from '@nestjs/swagger';
import { CreateUnitDto } from './create-unit.dto';
import { IsString } from 'class-validator';

export class UpdateUnitDto extends PartialType(CreateUnitDto) {
  @IsString()
  name: string;

  @IsString()
  initial: string;
}
