import { PartialType } from '@nestjs/swagger';

import { CreateQrCodeLabDto } from './create-qr-code-lab.dto';

export class UpdateQrCodeLabDto extends PartialType(CreateQrCodeLabDto) {}
