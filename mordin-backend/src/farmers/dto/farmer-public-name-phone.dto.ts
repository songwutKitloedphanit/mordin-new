import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class FarmerPublicNamePhoneDto {
  @Transform(({ value }) => (value == null ? '' : String(value).trim()))
  @IsString()
  @IsNotEmpty()
  @Length(1, 45)
  firstName!: string;

  @Transform(({ value }) =>
    value == null ? '' : String(value).replace(/\D/g, '')
  )
  @IsString()
  @IsNotEmpty()
  @Length(9, 20)
  phone!: string;
}
