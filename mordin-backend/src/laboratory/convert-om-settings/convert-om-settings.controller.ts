import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/auth/decorators/user.decorator';

import { ConvertOmSettingService } from './convert-om-settings.service';
import { CreateConvertOmSettingDto } from './dto/create-convert-om-setting.dto';
import { UpdateConvertOmSettingDto } from './dto/update-convert-om-setting.dto';

@Controller('convert-om-settings')
export class ConvertOmSettingController {
  constructor(
    private readonly convertOmSettingService: ConvertOmSettingService
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body() createConvertOmSettingDto: CreateConvertOmSettingDto,
    @User('sub') userId: number
  ) {
    return this.convertOmSettingService.create(
      createConvertOmSettingDto,
      userId
    );
  }

  @Get('/logs')
  getLogs() {
    return this.convertOmSettingService.getLogs();
  }

  @Get()
  findAll() {
    return this.convertOmSettingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.convertOmSettingService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateConvertOmSettingDto: UpdateConvertOmSettingDto,
    @User('sub') userId: number
  ) {
    return this.convertOmSettingService.update(
      +id,
      updateConvertOmSettingDto,
      userId
    );
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.convertOmSettingService.remove(+id);
  }
}
