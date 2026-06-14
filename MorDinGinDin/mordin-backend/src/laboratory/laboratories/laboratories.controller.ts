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
import { LaboratoriesService } from './laboratories.service';
import { CreateLaboratoryDto } from './dto/create-laboratory.dto';
import { UpdateLaboratoryDto } from './dto/update-laboratory.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/auth/decorators/user.decorator';

@Controller('laboratories')
export class LaboratoriesController {
  constructor(private readonly laboratoriesService: LaboratoriesService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createLaboratoryDto: CreateLaboratoryDto, @User('sub')  userId: number) {
    return this.laboratoriesService.create(createLaboratoryDto, userId);
  }

  @Get('/logs')
  getLogs() {
    return this.laboratoriesService.getLogs();
  }

  @Get()
  findAll() {
    return this.laboratoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.laboratoriesService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLaboratoryDto: UpdateLaboratoryDto,
    @User('sub')  userId: number
  ) {
    return this.laboratoriesService.update(+id, updateLaboratoryDto, userId);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.laboratoriesService.remove(+id);
  }
}
