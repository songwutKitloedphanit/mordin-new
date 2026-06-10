/* eslint-disable prettier/prettier */
import { PartialType } from '@nestjs/swagger';
import { CreateLandDto } from './create-land.dto';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsNumber,
} from 'class-validator';

export class UpdateLandDto extends PartialType(CreateLandDto) {}
