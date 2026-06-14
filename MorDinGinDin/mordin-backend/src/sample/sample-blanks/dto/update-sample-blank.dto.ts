import {
  IsString,
  IsNumber,
  IsEnum,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { SampleBlankType } from "../entities/sample-blank.entity";
import { UpdateSampleBlankResultDto } from "src/sample/sample-blank-results/dto/update-sample-blank-result.dto";

export class UpdateSampleBlankDto {
  @IsString()
  name: string;

  @IsNumber()
  repeatCount: number;

  @IsEnum(SampleBlankType)
  type: SampleBlankType;

  @ValidateNested({ each: true })
  @Type(() => UpdateSampleBlankResultDto)
  sampleBlankResult: UpdateSampleBlankResultDto[];
}
