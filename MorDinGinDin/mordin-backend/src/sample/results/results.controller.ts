import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { ResultsService } from './results.service';
import { CreateResultDto } from './dto/create-result.dto';
import { UpdateResultDto } from './dto/update-result.dto';
import { InputResultDto } from './dto/input-result.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ServiceCalendar } from 'src/service-calendars/entities/service-calendar.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/auth/decorators/user.decorator';

@Controller('results')
export class ResultsController {
  constructor(
    private readonly resultsService: ResultsService,
    @InjectRepository(ServiceCalendar)
    private readonly calRepo: Repository<ServiceCalendar>,
  ) { }

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createResultDto: CreateResultDto, @User('sub')  userId: number) {
    return this.resultsService.create(createResultDto, userId);
  }

  @UseGuards(AuthGuard)
  @Post('upload/csv')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCsvAndUpdateResults(
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) throw new BadRequestException('CSV file is required.');

    // 1) parse filename: Labresult_2025-07-12_1.csv
    const m = file.originalname.match(
      /^Labresult_(\d{4}-\d{2}-\d{2})_(\d+)\.csv$/
    );
    if (!m) {
      throw new BadRequestException(
        'Filename must be Labresult_YYYY-MM-DD_busId.csv'
      );
    }
    const [_, dateStr, busIdStr] = m;
    const date = new Date(dateStr);
    const busId = Number(busIdStr);

    // 2) look up the calendar
    const cal = await this.calRepo.findOne({
      where: { date, busId }
    });
    if (!cal) {
      throw new BadRequestException(
        `No service calendar found for ${dateStr} & bus ${busId}.`
      );
    }

    // 3) hand off to service, passing the calendar id
    return this.resultsService.processCsvWithMixedTypes(
      file.buffer,
      cal.serviceCalendarId
    );
  }

  @UseGuards(AuthGuard)
  @Patch('input')
  inputPreValue(@Body() inputs: InputResultDto[] , @User('sub')  userId: number) {
    return this.resultsService.updateResultFromPreValue(inputs, userId);
  }

  @Get()
  findAll() {
    return this.resultsService.findAll();
  }

  @Get('/logs')
  getLogs() {
    return this.resultsService.getLogs();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resultsService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateResultDto: UpdateResultDto, @User('sub')  userId: number) {
    return this.resultsService.update(+id, updateResultDto , userId);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.resultsService.remove(+id);
  }
}
