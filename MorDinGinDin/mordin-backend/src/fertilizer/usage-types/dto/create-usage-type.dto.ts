import { IsString } from 'class-validator';

export class CreateUsageTypeDto {
  @IsString()
  name: string;
}
