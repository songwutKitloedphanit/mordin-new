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
import { FertilizerMajorsService } from './fertilizer-majors.service';
import { CreateFertilizerMajorDto } from './dto/create-fertilizer-major.dto';
import { UpdateFertilizerMajorDto } from './dto/update-fertilizer-major.dto';
import { SearchFertilizerMajorDto } from './dto/search-fertilizer-major.dto';
import { FertilizerSummaryDto } from './dto/fertilizer-summary.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/auth/decorators/user.decorator';

@Controller('fertilizer-majors')
export class FertilizerMajorsController {
  constructor(
    private readonly fertilizerMajorsService: FertilizerMajorsService
  ) { }

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createFertilizerMajorDto: CreateFertilizerMajorDto, @User('sub') userId: number) {
    return this.fertilizerMajorsService.create(createFertilizerMajorDto, userId);
  }

  @Get()
  searchAndPagination(
    @Query() searchFertilizerMajorDto: SearchFertilizerMajorDto
  ) {
    return this.fertilizerMajorsService.searchAndPagination(
      searchFertilizerMajorDto
    );
  }

  @Get('/logs')
  getLogs() {
    return this.fertilizerMajorsService.getLogs();
  }

  @Get('summary')
  getFertilizerSummary(): Promise<FertilizerSummaryDto> {
    return this.fertilizerMajorsService.getFertilizerSummary();
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fertilizerMajorsService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFertilizerMajorDto: UpdateFertilizerMajorDto,
    @User('sub') userId: number
  ) {
    return this.fertilizerMajorsService.update(+id, updateFertilizerMajorDto, userId);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @User('sub') userId: number) {
    return this.fertilizerMajorsService.remove(+id, userId);
  }
}
