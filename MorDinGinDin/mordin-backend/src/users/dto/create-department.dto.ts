import { IsString, Length } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  @Length(1, 50)
  name: string;
}
