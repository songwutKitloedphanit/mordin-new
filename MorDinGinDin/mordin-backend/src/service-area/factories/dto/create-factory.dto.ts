import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, Length, ValidateNested } from 'class-validator';
import { CreateServiceAreaDto } from 'src/service-area/service-areas/dto/create-service-area.dto';

export class CreateFactoryDto {
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
  @Type(() => CreateServiceAreaDto)
  serviceAreas: CreateServiceAreaDto[];
}
