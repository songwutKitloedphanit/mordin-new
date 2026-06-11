import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/auth/decorators/user.decorator';

import { CreateQrCodeLabDto } from './dto/create-qr-code-lab.dto';
import { UpdateQrCodeLabDto } from './dto/update-qr-code-lab.dto';
import { QrCodeLabsService } from './qr-code-labs.service';

@Controller('qr-code-labs')
export class QrCodeLabsController {
  constructor(private readonly qrCodeLabsService: QrCodeLabsService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body() createQrCodeLabDto: CreateQrCodeLabDto,
    @User('sub') userId: number
  ) {
    return this.qrCodeLabsService.create(createQrCodeLabDto, userId);
  }

  @Get()
  findAll() {
    return this.qrCodeLabsService.findAll();
  }

  @Get('/logs')
  getLogs() {
    return this.qrCodeLabsService.getLogs();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.qrCodeLabsService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateQrCodeLabDto: UpdateQrCodeLabDto,
    @User('sub') userId: number
  ) {
    return this.qrCodeLabsService.update(+id, updateQrCodeLabDto, userId);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.qrCodeLabsService.remove(+id);
  }
}
