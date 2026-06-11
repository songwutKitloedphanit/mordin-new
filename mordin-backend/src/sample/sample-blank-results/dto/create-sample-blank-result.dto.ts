import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { RecordTypeEnum } from 'src/sample/enums/recode-type.enum';

export class CreateSampleBlankResultDto {
  @IsNumber()
  laboratoryId: number;

  @IsNumber()
  laboratorySettingId: number;

  @IsNumber()
  repeatNumber: number;

  @IsNumber()
  @IsOptional()
  preValue?: number;

  @IsNumber()
  certificate: number;

  @IsEnum(RecordTypeEnum)
  recordedType: RecordTypeEnum;
}
