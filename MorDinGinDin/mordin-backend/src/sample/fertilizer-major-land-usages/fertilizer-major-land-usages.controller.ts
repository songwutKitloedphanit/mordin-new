import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FertilizerMajorLandUsagesService } from './fertilizer-major-land-usages.service';
import { CreateFertilizerMajorLandUsageDto } from './dto/create-fertilizer-major-land-usage.dto';
import { UpdateFertilizerMajorLandUsageDto } from './dto/update-fertilizer-major-land-usage.dto';

@Controller('fertilizer-major-land-usages')
export class FertilizerMajorLandUsagesController {
  constructor(private readonly fertilizerMajorLandUsagesService: FertilizerMajorLandUsagesService) {}

  @Get('/logs')
  getLogs() {
    return this.fertilizerMajorLandUsagesService.getLogs();
  }
}
