import { Controller, Get } from '@nestjs/common';

import { FertilizerMinorLandUsagesService } from './fertilizer-minor-land-usages.service';

@Controller('fertilizer-minor-land-usages')
export class FertilizerMinorLandUsagesController {
  constructor(
    private readonly fertilizerMinorLandUsagesService: FertilizerMinorLandUsagesService
  ) {}

  @Get('/logs')
  getLogs() {
    return this.fertilizerMinorLandUsagesService.getLogs();
  }
}
