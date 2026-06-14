import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  ParseIntPipe,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { OwnerDataDto } from './dto/owner-data.dto';
import { GetReportDto } from './dto/get-report.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/auth/decorators/user.decorator';
import { Response } from 'express';
import { FarmersService } from '../../farmers/farmers.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingByFarmerDto } from './dto/update-booking-by-farmer.dto';

@Controller('books')
export class BooksController {
  constructor(
    private readonly booksService: BooksService,

    @Inject(forwardRef(() => FarmersService))
    private readonly farmersService: FarmersService,
  ) { }

  @Get('/logs')
  getLogs() {
    return this.booksService.getLogs();
  }

  @Get('service-calendar/:id')
  findBooksByServiceCalendarId(@Param('id') id: number) {
    return this.booksService.findReceivedBooksByServiceCalendarId(+id);
  }

  @Get('service-calendar/:id/results')
  findResultsByServiceCalendarId(@Param('id') id: number) {
    return this.booksService.findReceivedSamplesByServiceCalendarId(+id);
  }

  @Get('service-calendar/:id/reports')
  findSamplesForReportPage(@Param('id') id: number) {
    return this.booksService.findSamplesForReportPage(+id);
  }

  @UseGuards(AuthGuard)
  @Post('reports')
  getReports(@Body() dto: GetReportDto, @User('sub') userId: number) {
    // return this.booksService.getReports(dto.bookIds);
    return this.booksService.getReports(dto.sampleCodes);
  }

  // @UseGuards(AuthGuard)
  @Post('reports/pdf')
  async generatePdf(
    @Body() dto: GetReportDto,
    @Res() res: Response,
  ) {
    const reports = await this.booksService.getReports(dto.sampleCodes);
    return this.booksService.generatePdf(reports, res);
  }

  // @UseGuards(AuthGuard)
  @Post('reports/summary/:landId/pdf')
  async generateSummaryReportByLandPdf(
    @Param('landId', ParseIntPipe) landId: number,
    @Res() res: Response,
  ) {
    const landSummary = await this.farmersService.getFarmerSummaryReportsByLand(landId);
    return this.booksService.generateSummaryReportByLandPdf(landSummary, res);
  }

  @UseGuards(AuthGuard)
  @Patch('service-calendar/:id/selects')
  selectReceivedBooksByServiceCalendarId(@Param('id') id: number, @Body() bookId: number[], @User('sub') userId: number) {
    return this.booksService.selectReceivedBooksByBookId(+id, bookId, userId);
  }

  @UseGuards(AuthGuard)
  @Patch('settings/:id')
  settingOwnerData(@Param('id') id: number, @Body() ownerData: OwnerDataDto, @User('sub') userId: number) {
    return this.booksService.settingOwnerData(+id, ownerData, userId);
  }

  @Post('booking')
  createBooking(@Body() createBookingDto: CreateBookingDto) {
    return this.booksService.createBooking(createBookingDto);
  }

  @Get('booking/calendar/:id')
  findBookings(@Param('id') id: string) {
    return this.booksService.findBookingsByCalendarId(+id);
  }

  @Post('pair')
  pairBooking(@Body() body: { bookId: number; qrCode: string }) {
    return this.booksService.pairBookingWithQrCode(body.bookId, body.qrCode);
  }

  @Patch('booking/:bookId')
  updateBooking(
    @Param('bookId', ParseIntPipe) bookId: number,
    @Body() updateBookingDto: UpdateBookingByFarmerDto,
  ) {
    return this.booksService.updateBooking(bookId, updateBookingDto);
  }

  @Delete('booking/:bookId/farmer/:farmerId')
  cancelBooking(
    @Param('bookId', ParseIntPipe) bookId: number,
    @Param('farmerId', ParseIntPipe) farmerId: number,
  ) {
    return this.booksService.cancelBooking(bookId, farmerId);
  }
}
