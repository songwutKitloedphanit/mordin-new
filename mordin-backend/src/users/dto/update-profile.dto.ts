import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class UpdateProfileDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 45)
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 45)
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  @Length(1, 100)
  email: string;
}
