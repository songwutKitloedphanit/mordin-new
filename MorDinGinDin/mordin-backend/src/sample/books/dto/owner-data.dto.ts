import { IsDecimal, IsNumber, IsOptional } from "class-validator";

export class OwnerDataDto {
    @IsOptional()
    @IsNumber()
    farmerId?: number;

    @IsOptional()
    @IsNumber()
    landId?: number;

    @IsOptional()
    @IsNumber()
    serviceTypeId?: number;

    @IsOptional()
    @IsDecimal(
        { decimal_digits: '1,6' },
        { message:
            'latitude must be a decimal with up to 6 digits after the decimal point'
        })
    latitude?: string;

    @IsOptional()
    @IsDecimal(
        { decimal_digits: '1,6' },
        { message:
            'longitude must be a decimal with up to 6 digits after the decimal point'
        })
    longitude?: string;
}