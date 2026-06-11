import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/auth/decorators/user.decorator';

import { ApproveQrCodeDto } from './dto/approve-qr-code.dto';
import { CreateQrCodeDto } from './dto/create-qr-code.dto';
import { QrCodeSummaryDto } from './dto/qr-code-summary.dto';
import { ReceiveSampleDto } from './dto/receive-sample.dto';
import { SearchQrCodeDto } from './dto/search-qr-code.dto';
import { UpdateQrCodeDto } from './dto/update-qr-code.dto';
import { QrCodesService } from './qr-codes.service';

@Controller('qr-codes')
export class QrCodesController {
  constructor(private readonly qrCodesService: QrCodesService) {}

  @UseGuards(AuthGuard)
  @Patch('approve')
  async approveQrCodeSampleByBookId(@Body() dto: ApproveQrCodeDto) {
    return this.qrCodesService.approveQrCodeSampleByBookId(dto.bookIds);
  }

  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body() createQrCodeDto: CreateQrCodeDto,
    @User('sub') userId: number
  ) {
    return this.qrCodesService.create(createQrCodeDto, userId);
  }

  @UseGuards(AuthGuard)
  @Get()
  search(@Query() searchDto: SearchQrCodeDto) {
    return this.qrCodesService.searchAndPagination(searchDto);
  }

  @UseGuards(AuthGuard)
  @Get('/logs')
  getLogs() {
    return this.qrCodesService.getLogs();
  }

  @UseGuards(AuthGuard)
  @Get('summary')
  async getQrCodeSummary(): Promise<QrCodeSummaryDto> {
    return this.qrCodesService.getQrCodeSummary();
  }

  @UseGuards(AuthGuard)
  @Get('collected')
  findCollectedQrCodes() {
    return this.qrCodesService.findCollectedQrCodes();
  }

  @Get('encrypt-code/:code')
  encryptQrCode(@Param('code') code: string) {
    return this.qrCodesService.findOneByEncryptCode(code);
  }

  @Get('check-encrypt/:code')
  checkEncryptQrCode(@Param('code') code: string) {
    return this.qrCodesService.checkEncryptQrCode(code);
  }

  @UseGuards(AuthGuard)
  @Get('encrypt/:qrCode')
  getEncryptQrCode(@Param('qrCode') qrCode: string) {
    return this.qrCodesService.encryptQrCode(qrCode);
  }

  @UseGuards(AuthGuard)
  @Get('decrypt/:code')
  getDecryptCode(@Param('code') code: string) {
    return this.qrCodesService.getDecryptCode(code);
  }

  @UseGuards(AuthGuard)
  @Get(':qrcode')
  findOne(@Param('qrcode') qrCode: string) {
    return this.qrCodesService.findOne(qrCode);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQrCodeDto: UpdateQrCodeDto,
    @User('sub') userId: number
  ) {
    return this.qrCodesService.update(id, updateQrCodeDto, userId);
  }

  @UseGuards(AuthGuard)
  @Patch('receive-sample/encrypted/:code')
  receiveSampleByEncryptedCode(
    @Param('code') code: string,
    @Body() receiveSampleDto: ReceiveSampleDto,
    @User('sub') userId: number
  ) {
    return this.qrCodesService.receiveQrCodeSampleByEncryptedCode(
      code,
      receiveSampleDto,
      userId
    );
  }

  @UseGuards(AuthGuard)
  @Patch('receive-sample/decrypted/:code')
  receiveSampleByDecryptedCode(
    @Param('code') code: string,
    @Body() receiveSampleDto: ReceiveSampleDto,
    @User('sub') userId: number
  ) {
    return this.qrCodesService.receiveQrCodeSampleByDecryptedCode(
      code,
      receiveSampleDto,
      userId
    );
  }

  @Patch('update-data-by-farmer/:code')
  updateDataByFarmer(
    @Param('code') code: string,
    @Body() updateData: UpdateQrCodeDto
  ) {
    return this.qrCodesService.updateDataByFarmer(code, updateData);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.qrCodesService.remove(id);
  }

  @UseGuards(AuthGuard)
  @Post('/generate/:number')
  generateQrCode(
    @Param('number', ParseIntPipe) number: number,
    @Body() createQrCodeDto: CreateQrCodeDto,
    @User('sub') userId: number
  ) {
    return this.qrCodesService.generateQrCode(number, createQrCodeDto, userId);
  }
}
