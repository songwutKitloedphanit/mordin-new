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
import { FertilizerMinorsService } from './fertilizer-minors.service';
import { CreateFertilizerMinorDto } from './dto/create-fertilizer-minor.dto';
import { UpdateFertilizerMinorDto } from './dto/update-fertilizer-minor.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/auth/decorators/user.decorator';

@Controller('fertilizer-minors')
export class FertilizerMinorsController {
  constructor(
    private readonly fertilizerMinorsService: FertilizerMinorsService,
  ) { }

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createFertilizerMinorDto: CreateFertilizerMinorDto, @User('sub') userId: number) {
    return this.fertilizerMinorsService.create(createFertilizerMinorDto, userId);
  }

  @Get()
  findAll() {
    return this.fertilizerMinorsService.findAll();
  }

  @Get('/logs')
  getLogs() {
    return this.fertilizerMinorsService.getLogs();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fertilizerMinorsService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFertilizerMinorDto: UpdateFertilizerMinorDto,
    @User('sub') userId: number
  ) {
    return this.fertilizerMinorsService.update(+id, updateFertilizerMinorDto, userId);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @User('sub') userId: number) {
    return this.fertilizerMinorsService.remove(+id, userId);
  }
}
