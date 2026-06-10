import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { CreateServiceAreaDto } from 'src/service-area/service-areas/dto/create-service-area.dto';
import { UpdateServiceAreaDto } from 'src/service-area/service-areas/dto/update-service-area.dto';

export class UpdateFactoryDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  name: string;

  @IsString()
  @Length(3, 4)
  initial: string;

  @IsString()
  note?: string;

  @ValidateNested({ each: true })
  @Type(() => UpdateServiceAreaDto)
  serviceAreas: UpdateServiceAreaDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateServiceAreaDto)
  newServiceAreas: CreateServiceAreaDto[];
}
