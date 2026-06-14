import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator'; // เพิ่ม Max, Min
import { BaseSearchDto } from 'src/common/dto/base-search.dto';
import { QrCodeTypeEnum, SampleStatusEnum } from '../../enums/qr-code.enum';

export class SearchQrCodeDto extends BaseSearchDto {
  @IsOptional()
  @IsEnum(SampleStatusEnum, { each: true }) // each: true เพื่อ validate ทุกค่าใน array
  @Transform(({ value }) => (Array.isArray(value) ? value : [value])) // แปลงค่าเดียวให้เป็น array
  status?: SampleStatusEnum[];

  @IsOptional()
  @IsEnum(QrCodeTypeEnum)
  type?: QrCodeTypeEnum;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  serviceAreaId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  factoryId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  serviceCalendarId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  receivedServiceCalendarId?: number;

  override sortBy?: string = 'createdAt';
  override order?: 'ASC' | 'DESC' = 'DESC';
}