import { IsNotEmpty, IsNumber } from 'class-validator';

export class MoveServiceAreaDto {
  @IsNotEmpty()
  @IsNumber()
  factoryId: number;
}
