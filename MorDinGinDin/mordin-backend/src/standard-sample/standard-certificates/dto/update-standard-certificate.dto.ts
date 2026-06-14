import { IsNumber } from "class-validator";

export class UpdateStandardCertificateDto {
    @IsNumber()
    laboratoryId: number;

    @IsNumber()
    certificateValue: number;
}
