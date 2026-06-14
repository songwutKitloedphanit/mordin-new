import { IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';

export class CreateServiceAreaDto {
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  @Length(0, 45)
  name: string;

  @IsString()
  note?: string;
}
