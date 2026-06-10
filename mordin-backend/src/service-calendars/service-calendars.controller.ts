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
} from '@nestjs/common';
import { ServiceCalendarsService } from './service-calendars.service';
import { CreateServiceCalendarDto } from './dto/create-service-calendar.dto';
import { UpdateServiceCalendarDto } from './dto/update-service-calendar.dto';
import { SearchServiceCalendarDto } from './dto/search-service-calendar.dto';
import { HttpService } from '@nestjs/axios';
import { ServiceCalendarSummaryDto } from './dto/service-calendar-summary.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/auth/decorators/user.decorator';

@Controller('service-calendars')
export class ServiceCalendarsController {
  constructor(
    private readonly serviceCalendarsService: ServiceCalendarsService,
    private readonly httpService: HttpService
  ) { }
  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body() createServiceCalendarDto: CreateServiceCalendarDto,
    @User('sub') userId: number
  ) {
    return this.serviceCalendarsService.create(
      createServiceCalendarDto,
      userId
    );
  }

  @Get()
  search(@Query() searchDto: SearchServiceCalendarDto) {
    return this.serviceCalendarsService.searchAndPagination(searchDto);
  }

  @Get('/upcoming')
  findUpcoming() {
    return this.serviceCalendarsService.findUpComing();
  }
  @Get('/resolve-map-link')
  async resolveMapLink(
    @Query('url') url: string
  ): Promise<{ resolvedUrl: string }> {
    const response = await this.httpService.axiosRef.head(url, {
      maxRedirects: 5,
    });
    return { resolvedUrl: response.request.res.responseUrl };
  }
  @Get('summary')
  async getCalendarSummary(
    @Query() searchDto: SearchServiceCalendarDto // รับ params: year, month
  ): Promise<ServiceCalendarSummaryDto> {
    return this.serviceCalendarsService.getCalendarSummary(searchDto);
  }

  @Get('/log')
  getLogs() {
    return this.serviceCalendarsService.getLogs();
  }

  @Get('public/upcoming')
  getPublicUpcoming() {
    return this.serviceCalendarsService.getPublicUpcomingCalendars();
  }

  @UseGuards(AuthGuard)
  @Post(':id/init-settings')
  initSettings(@Param('id') id: string, @User('sub') userId: number) {
    return this.serviceCalendarsService.initSettingsForCalendar(+id, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceCalendarsService.findOne(+id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateServiceCalendarDto: UpdateServiceCalendarDto,
    @User('sub') userId: number
  ) {
    return this.serviceCalendarsService.update(
      +id,
      updateServiceCalendarDto,
      userId
    );
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @User('sub') userId: number) {
    return this.serviceCalendarsService.remove(+id, userId);
  }
}
