import { IsDecimal, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class UpdateQrCodeDto {
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsString()
    @IsNotEmpty()
    phoneNumber: string;

    @IsString()
    thaiNationalId: string;

    @IsNumber()
    serviceAreaId: number;

    @IsString()
    landCode: string;

    @IsString()
    landName: string;

    @IsNumber()
    serviceTypeId: number;

    @IsDecimal({
        decimal_digits: '1,6',
    }, {
        message: 'latitude must be a decimal with up to 6 digits after the decimal point',
    })
    latitude: string;

    @IsDecimal({
        decimal_digits: '1,6',
    }, {
        message: 'longitude must be a decimal with up to 6 digits after the decimal point',
    })
    longitude: string;

}
