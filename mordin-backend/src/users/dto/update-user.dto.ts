import { PartialType } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
} from 'class-validator';

import { UserRoles } from '../enums/user.enum';

import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
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
  email: string;

  @IsNotEmpty()
  @IsEnum(UserRoles)
  role: UserRoles;

  @IsNotEmpty()
  @IsNumber()
  departmentId: number;
}
