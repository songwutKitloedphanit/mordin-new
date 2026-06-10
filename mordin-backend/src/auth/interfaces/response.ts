import { ApiProperty } from '@nestjs/swagger';

export class BaseResponse<T = string> {
  @ApiProperty()
  code: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false })
  data?: T;

  @ApiProperty({ required: false})
  error?: string;
}
