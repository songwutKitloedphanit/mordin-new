import { IsNumber } from "class-validator";

export class CreateStandardCertificateDto {
    @IsNumber()
    laboratoryId: number;

    @IsNumber()
    certificateValue: number;
}
