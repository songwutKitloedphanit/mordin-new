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
import { BusesService } from './buses.service';
import { CreateBusDto } from './dto/create-bus.dto';
import { UpdateBusDto } from './dto/update-bus.dto';
import { User } from 'src/auth/decorators/user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('buses')
export class BusesController {
  constructor(private readonly busesService: BusesService) { }

  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body() createBusDto: CreateBusDto,
    @User('sub') userId: number
  ) {
    return this.busesService.create(createBusDto , userId);
  }

  @Get()
  findAll() {
    return this.busesService.findAll();
  }

  @Get('/summary')
  getSummary() {
    return this.busesService.getSummary();
  }

  @Get('/logs')
  getLogs() {
    return this.busesService.getLogs();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.busesService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBusDto: UpdateBusDto, @User('sub') userId: number) {
    return this.busesService.update(+id, updateBusDto, userId);
  }
  
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @User('sub') userId: number) {
    return this.busesService.remove(+id, userId);
  }
}
