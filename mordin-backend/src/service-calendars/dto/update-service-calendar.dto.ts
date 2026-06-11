import { PartialType } from '@nestjs/swagger';

import { CreateServiceCalendarDto } from './create-service-calendar.dto';

export class UpdateServiceCalendarDto extends PartialType(
  CreateServiceCalendarDto
) {}
