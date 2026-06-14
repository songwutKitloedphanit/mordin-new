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
import { StandardsService } from './standards.service';
import { CreateStandardDto } from './dto/create-standard.dto';
import { UpdateStandardDto } from './dto/update-standard.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/auth/decorators/user.decorator';

@Controller('standards')
export class StandardsController {
  constructor(private readonly standardsService: StandardsService) {}
  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body() createStandardDto: CreateStandardDto,
    @User('sub') userId: number
  ) {
    return this.standardsService.create(createStandardDto, userId);
  }

  @Get()
  findAll() {
    return this.standardsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.standardsService.findOne(+id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStandardDto: UpdateStandardDto,
    @User('sub') userId: number
  ) {
    return this.standardsService.update(+id, updateStandardDto, userId);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.standardsService.remove(+id);
  }

  @Get('/log')
  getLogs() {
    return this.standardsService.getLogs();
  }
}
