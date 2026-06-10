import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class SupersedeServiceAreaDto {
  @IsInt()
  targetFactoryId: number;

  @IsDateString()
  effectiveFrom: string;

  @IsOptional()
  @IsString()
  @Length(1, 10)
  code?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @Length(1, 45)
  name?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
