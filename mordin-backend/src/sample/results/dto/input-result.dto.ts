import { IsNumber } from "class-validator";

export class InputResultDto {
    @IsNumber()
    resultId: number;

    @IsNumber()
    preValue: number;
}