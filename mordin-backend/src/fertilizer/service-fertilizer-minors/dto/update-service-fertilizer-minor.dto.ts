import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';
import { UpdateServiceFertilizerMinorUsageDto } from 'src/fertilizer/service-fertilizer-minor-usages/dto/update-service-fertilizer-minor-usage.dto';

export class UpdateServiceFertilizerMinorDto {
  @IsNotEmpty()
  @IsNumber()
  laboratoryId: number;

  @IsNotEmpty()
  @IsNumber()
  unitId: number;

  @ValidateNested({ each: true })
  @Type(() => UpdateServiceFertilizerMinorUsageDto)
  serviceFertilizerMinorUsages: UpdateServiceFertilizerMinorUsageDto[];
}
