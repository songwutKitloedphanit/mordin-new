import { PartialType } from '@nestjs/swagger';

import { CreateFertilizerMinorLandUsageDto } from './create-fertilizer-minor-land-usage.dto';

export class UpdateFertilizerMinorLandUsageDto extends PartialType(
  CreateFertilizerMinorLandUsageDto
) {}
