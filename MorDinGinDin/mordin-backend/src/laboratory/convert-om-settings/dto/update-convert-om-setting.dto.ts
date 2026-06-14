import { PartialType } from '@nestjs/swagger';
import { CreateConvertOmSettingDto } from "./create-convert-om-setting.dto";
import { IsNumber } from 'class-validator';

export class UpdateConvertOmSettingDto{

    @IsNumber()
    intercept:number;
    
    @IsNumber()
    slope:number;
}