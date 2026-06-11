import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateServiceAreaDto {
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  @Length(0, 45)
  name: string;

  @IsOptional()
  @IsString()
  note?: string;
}
