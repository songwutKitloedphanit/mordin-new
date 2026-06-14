import { PartialType } from '@nestjs/swagger';
import { CreateServiceCalendarDto } from './create-service-calendar.dto';
import {
  IsDateString,
  IsDecimal,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class UpdateServiceCalendarDto extends PartialType(
  CreateServiceCalendarDto,
) {}
