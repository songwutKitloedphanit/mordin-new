import { PartialType } from '@nestjs/swagger';

import { CreateFertilizerMajorLandScoreDto } from './create-fertilizer-major-land-score.dto';

export class UpdateFertilizerMajorLandScoreDto extends PartialType(
  CreateFertilizerMajorLandScoreDto
) {}
