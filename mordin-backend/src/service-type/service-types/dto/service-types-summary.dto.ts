import { IsNumber } from "class-validator";

export class ServiceTypesSummaryDTO {
    @IsNumber()
    totalServiceTypes : number;
    @IsNumber()
    totalServiceLaboratories : number;
}