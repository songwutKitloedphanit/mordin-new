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

import { CreateUsageTypeDto } from './dto/create-usage-type.dto';
import { UpdateUsageTypeDto } from './dto/update-usage-type.dto';
import { UsageTypesService } from './usage-types.service';

@Controller('usage-types')
export class UsageTypesController {
  constructor(private readonly usageTypesService: UsageTypesService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body() createUsageTypeDto: CreateUsageTypeDto,
    @User('sub') userId: number
  ) {
    return this.usageTypesService.create(createUsageTypeDto, userId);
  }

  @Get()
  findAll() {
    return this.usageTypesService.findAll();
  }

  @Get('/logs')
  getLogs() {
    return this.usageTypesService.getLogs();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usageTypesService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUsageTypeDto: UpdateUsageTypeDto,
    @User('sub') userId: number
  ) {
    return this.usageTypesService.update(+id, updateUsageTypeDto, userId);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usageTypesService.remove(+id);
  }
}
