import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { QrCodeTypeEnum } from 'src/sample/enums/qr-code.enum';

export class CreateQrCodeDto {
  @IsEnum(QrCodeTypeEnum)
  type: QrCodeTypeEnum;

  @IsNumber()
  @IsOptional()
  serviceAreaId: number;

  @IsNumber()
  @IsOptional()
  serviceCalendarId: number;
}
