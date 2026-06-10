import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class FarmerPublicLoginDto {
  @Transform(({ value }) => value == null ? '' : String(value).replace(/\D/g, ''))
  @IsString()
  @IsNotEmpty()
  @Length(9, 20)
  phone!: string;

  @IsString()
  @IsNotEmpty()
  birthDate!: string;
}
