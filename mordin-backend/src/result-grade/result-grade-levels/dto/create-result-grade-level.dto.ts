import { IsNumber, IsString } from "class-validator";

export class CreateResultGradeLevelDto {
    @IsNumber()
    level: number;

    @IsString()
    color: string;

    @IsNumber()
    cutoffValue: number;

    @IsString()
    cutoffText: string;

    @IsString()
    scoreName: string;
}
