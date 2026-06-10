import { PartialType } from '@nestjs/swagger';
import { CreateServiceTypeDto } from './create-service-type.dto';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateServiceCategoryDto } from 'src/service-type/service-categories/dto/create-service-category.dto';
import { CreateServiceLaboratoryDto } from 'src/service-type/service-laboratories/dto/create-service-laboratory.dto';
import { Type } from 'class-transformer';
import { ServiceTypeColor } from 'src/service-type/enums/service-types.enum';
import { UpdateServiceCategoryDto } from 'src/service-type/service-categories/dto/update-service-category.dto';
import { UpdateServiceLaboratoryDto } from 'src/service-type/service-laboratories/dto/update-service-laboratory.dto';

export class UpdateServiceTypeDto {
  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsString()
  unitDetail: string;

  @IsBoolean()
  isDisplay?: boolean;

  @IsEnum(ServiceTypeColor)
  color: ServiceTypeColor;

  @ValidateNested({ each: true })
  @Type(() => UpdateServiceCategoryDto)
  serviceCategories: UpdateServiceCategoryDto[];

  @ValidateNested({ each: true })
  @Type(() => UpdateServiceLaboratoryDto)
  serviceLaboratories: UpdateServiceLaboratoryDto[];
}
