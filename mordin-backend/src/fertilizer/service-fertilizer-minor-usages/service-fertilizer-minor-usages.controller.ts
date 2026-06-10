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
import { ServiceFertilizerMinorUsagesService } from './service-fertilizer-minor-usages.service';
import { CreateServiceFertilizerMinorUsageDto } from './dto/create-service-fertilizer-minor-usage.dto';
import { UpdateServiceFertilizerMinorUsageDto } from './dto/update-service-fertilizer-minor-usage.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/auth/decorators/user.decorator';

@Controller('service-fertilizer-minor-usages')
export class ServiceFertilizerMinorUsagesController {
  constructor(
    private readonly serviceFertilizerMinorUsagesService: ServiceFertilizerMinorUsagesService,
  ) {}
  
  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body()
    createServiceFertilizerMinorUsageDto: CreateServiceFertilizerMinorUsageDto,
    @User('sub')  userId: number
  ) {
    return this.serviceFertilizerMinorUsagesService.create(
      createServiceFertilizerMinorUsageDto,
      userId
    );
  }

  @Get()
  findAll() {
    return this.serviceFertilizerMinorUsagesService.findAll();
  }

  @Get('/logs')
  getLogs() {
    return this.serviceFertilizerMinorUsagesService.getLogs();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceFertilizerMinorUsagesService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateServiceFertilizerMinorUsageDto: UpdateServiceFertilizerMinorUsageDto,
    @User('sub')  userId: number
  ) {
    return this.serviceFertilizerMinorUsagesService.update(
      +id,
      updateServiceFertilizerMinorUsageDto,
      userId
    );
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serviceFertilizerMinorUsagesService.remove(+id);
  }
}
