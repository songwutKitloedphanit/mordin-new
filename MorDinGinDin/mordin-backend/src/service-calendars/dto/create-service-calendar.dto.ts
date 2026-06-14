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

export class CreateServiceCalendarDto {
  @IsDateString()
  @IsNotEmpty()
  date: Date;

  @IsInt()
  @IsNotEmpty()
  busId: number;

  @IsInt()
  @IsNotEmpty()
  numberOfSamples: number;

  @IsInt()
  @IsNotEmpty()
  numberOfBookings: number;

  @IsInt()
  @IsNotEmpty()
  numberOfExaminations: number;

  @IsString()
  @Length(6, 6)
  @IsNotEmpty()
  subdistrictCode: string;

  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  village: string;

  @IsDecimal(
    { decimal_digits: '1,6' },
    {
      message:
        'latitude must be a decimal with up to 6 digits after the decimal point',
    },
  )
  @IsNotEmpty()
  latitude: string;

  @IsDecimal(
    { decimal_digits: '1,6' },
    {
      message:
        'longitude must be a decimal with up to 6 digits after the decimal point',
    },
  )
  @IsNotEmpty()
  longitude: string;

  @IsString()
  description: string;
}
