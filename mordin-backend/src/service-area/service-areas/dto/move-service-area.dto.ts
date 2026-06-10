import { IsInt, Min } from 'class-validator';

export class MoveServiceAreaDto {
  @IsInt()
  @Min(1)
  targetFactoryId: number;
}
