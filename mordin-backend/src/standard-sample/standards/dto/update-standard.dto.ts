import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { UpdateStandardCertificateDto } from 'src/standard-sample/standard-certificates/dto/update-standard-certificate.dto';

export class UpdateStandardDto {
  @IsString()
  standardName: string;

  @ValidateNested({ each: true })
  @Type(() => UpdateStandardCertificateDto)
  standardCertificates: UpdateStandardCertificateDto[];
}
