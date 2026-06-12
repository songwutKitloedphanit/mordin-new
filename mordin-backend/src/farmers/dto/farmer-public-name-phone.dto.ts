import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class FarmerPublicNamePhoneDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'birthDate must be in YYYY-MM-DD format',
  })
  birthDate!: string;

  @Transform(({ value }) =>
    value == null ? '' : String(value).replace(/\D/g, '')
  )
  @IsString()
  @IsNotEmpty()
  @Length(9, 20)
  phone!: string;
}
