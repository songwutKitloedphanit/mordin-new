import { Controller, Get } from '@nestjs/common';

import { FertilizerMajorLandUsagesService } from './fertilizer-major-land-usages.service';

@Controller('fertilizer-major-land-usages')
export class FertilizerMajorLandUsagesController {
  constructor(
    private readonly fertilizerMajorLandUsagesService: FertilizerMajorLandUsagesService
  ) {}

  @Get('/logs')
  getLogs() {
    return this.fertilizerMajorLandUsagesService.getLogs();
  }
}
