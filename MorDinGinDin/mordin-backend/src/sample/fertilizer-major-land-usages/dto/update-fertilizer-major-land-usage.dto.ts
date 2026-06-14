import { PartialType } from '@nestjs/swagger';
import { CreateFertilizerMajorLandUsageDto } from './create-fertilizer-major-land-usage.dto';

export class UpdateFertilizerMajorLandUsageDto extends PartialType(CreateFertilizerMajorLandUsageDto) {}
