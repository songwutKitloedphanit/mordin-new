import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';
import { CreateServiceFertilizerMinorUsageDto } from 'src/fertilizer/service-fertilizer-minor-usages/dto/create-service-fertilizer-minor-usage.dto';

export class CreateServiceFertilizerMinorDto {
  @IsNotEmpty()
  @IsNumber()
  serviceTypeId: number;

  @IsNotEmpty()
  @IsNumber()
  fertilizerMinorId: number;

  @IsNotEmpty()
  @IsNumber()
  laboratoryId: number;

  @IsNotEmpty()
  @IsNumber()
  unitId: number;

  @ValidateNested({ each: true })
  @Type(() => CreateServiceFertilizerMinorUsageDto)
  serviceFertilizerMinorUsages: CreateServiceFertilizerMinorUsageDto[];
}
