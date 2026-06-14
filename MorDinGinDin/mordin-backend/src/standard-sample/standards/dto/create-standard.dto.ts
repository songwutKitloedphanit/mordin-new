import { Type } from "class-transformer";
import { IsString, Validate, ValidateNested } from "class-validator";
import { CreateStandardCertificateDto } from "src/standard-sample/standard-certificates/dto/create-standard-certificate.dto";

export class CreateStandardDto {
    @IsString()
    standardName: string;

    @ValidateNested({ each: true })
    @Type(() => CreateStandardCertificateDto)
    standardCertificates: CreateStandardCertificateDto[];
}
