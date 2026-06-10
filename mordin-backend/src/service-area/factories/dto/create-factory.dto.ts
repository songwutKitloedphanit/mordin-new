import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { CreateServiceAreaDto } from 'src/service-area/service-areas/dto/create-service-area.dto';

export class CreateFactoryDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  name: string;

  @IsString()
  @Length(3, 4)
  initial: string;

  @IsOptional()
  @IsString()
  note?: string;

  @ValidateNested({ each: true })
  @Type(() => CreateServiceAreaDto)
  serviceAreas: CreateServiceAreaDto[];
}
