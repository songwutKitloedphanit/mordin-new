import { PartialType } from '@nestjs/swagger';

import { CreateGeographyDto } from './create-geography.dto';

export class UpdateGeographyDto extends PartialType(CreateGeographyDto) {}
