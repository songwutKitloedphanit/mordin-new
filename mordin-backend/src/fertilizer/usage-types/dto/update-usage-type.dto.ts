import { PartialType } from '@nestjs/swagger';

import { CreateUsageTypeDto } from './create-usage-type.dto';

export class UpdateUsageTypeDto extends PartialType(CreateUsageTypeDto) {}
