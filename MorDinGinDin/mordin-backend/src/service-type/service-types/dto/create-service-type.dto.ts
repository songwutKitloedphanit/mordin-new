import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ServiceTypeColor } from 'src/service-type/enums/service-types.enum';
import { CreateServiceCategoryDto } from 'src/service-type/service-categories/dto/create-service-category.dto';
import { CreateServiceLaboratoryDto } from 'src/service-type/service-laboratories/dto/create-service-laboratory.dto';

export class CreateServiceTypeDto {
  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsString()
  unitDetail: string;

  @IsBoolean()
  isDisplay: boolean;

  @IsEnum(ServiceTypeColor)
  color: ServiceTypeColor;

  @ValidateNested({ each: true })
  @Type(() => CreateServiceCategoryDto)
  serviceCategories: CreateServiceCategoryDto[];

  @ValidateNested({ each: true })
  @Type(() => CreateServiceLaboratoryDto)
  serviceLaboratories: CreateServiceLaboratoryDto[];
}
