import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/auth/decorators/user.decorator';

import { CreateFertilizerMajorLandScoreDto } from './dto/create-fertilizer-major-land-score.dto';
import { GetGraphFilterDto } from './dto/get-graph-filter.dto';
import { UpdateFertilizerMajorLandScoreDto } from './dto/update-fertilizer-major-land-score.dto';
import { FertilizerMajorLandScoresService } from './fertilizer-major-land-scores.service';

@Controller('fertilizer-major-land-scores')
export class FertilizerMajorLandScoresController {
  constructor(
    private readonly fertilizerMajorLandScoresService: FertilizerMajorLandScoresService
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body()
    createFertilizerMajorLandScoreDto: CreateFertilizerMajorLandScoreDto,
    @User('sub') userId: number
  ) {
    return this.fertilizerMajorLandScoresService.create(
      createFertilizerMajorLandScoreDto,
      userId
    );
  }

  @Get('/logs')
  getLogs() {
    return this.fertilizerMajorLandScoresService.getLogs();
  }

  @Get('graph')
  getGraphData(@Query() filterDto: GetGraphFilterDto) {
    return this.fertilizerMajorLandScoresService.getGraphData(filterDto);
  }

  @Get('summary')
  getSummaryCards() {
    return this.fertilizerMajorLandScoresService.getSummaryCards();
  }

  @Get()
  findAll() {
    return this.fertilizerMajorLandScoresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fertilizerMajorLandScoresService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateFertilizerMajorLandScoreDto: UpdateFertilizerMajorLandScoreDto,
    @User('sub') userId: number
  ) {
    return this.fertilizerMajorLandScoresService.update(
      +id,
      updateFertilizerMajorLandScoreDto,
      userId
    );
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fertilizerMajorLandScoresService.remove(+id);
  }
}
