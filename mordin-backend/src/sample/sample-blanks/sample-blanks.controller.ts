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

import { CreateSampleBlankDto } from './dto/create-sample-blank.dto';
import { UpdateSampleBlankDto } from './dto/update-sample-blank.dto';
import { SampleBlanksService } from './sample-blanks.service';

@Controller('sample-blanks')
export class SampleBlanksController {
  constructor(private readonly sampleBlanksService: SampleBlanksService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body() createSampleBlankDto: CreateSampleBlankDto,
    @User('sub') userId: number
  ) {
    return this.sampleBlanksService.create(createSampleBlankDto, userId);
  }

  @Get()
  findAll() {
    return this.sampleBlanksService.findAll();
  }

  @Get('/logs')
  getLogs() {
    return this.sampleBlanksService.getLogs();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sampleBlanksService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSampleBlankDto: UpdateSampleBlankDto,
    @User('sub') userId: number
  ) {
    return this.sampleBlanksService.update(+id, updateSampleBlankDto, userId);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sampleBlanksService.remove(+id);
  }
}
