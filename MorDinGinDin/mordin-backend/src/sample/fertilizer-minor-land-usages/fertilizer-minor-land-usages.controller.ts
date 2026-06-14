import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FertilizerMinorLandUsagesService } from './fertilizer-minor-land-usages.service';
import { CreateFertilizerMinorLandUsageDto } from './dto/create-fertilizer-minor-land-usage.dto';
import { UpdateFertilizerMinorLandUsageDto } from './dto/update-fertilizer-minor-land-usage.dto';

@Controller('fertilizer-minor-land-usages')
export class FertilizerMinorLandUsagesController {
  constructor(private readonly fertilizerMinorLandUsagesService: FertilizerMinorLandUsagesService) {}

  @Get('/logs')
  getLogs() {
    return this.fertilizerMinorLandUsagesService.getLogs();
  }
}
