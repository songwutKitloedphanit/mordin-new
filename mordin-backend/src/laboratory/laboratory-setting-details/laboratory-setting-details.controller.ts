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
import { LaboratorySettingDetailsService } from './laboratory-setting-details.service';
import { CreateLaboratorySettingDetailDto } from './dto/create-laboratory-setting-detail.dto';
import { UpdateLaboratorySettingDetailDto } from './dto/update-laboratory-setting-detail.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/auth/decorators/user.decorator';

@Controller('laboratory-setting-details')
export class LaboratorySettingDetailsController {
  constructor(
    private readonly laboratorySettingDetailsService: LaboratorySettingDetailsService,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body() createLaboratorySettingDetailDto: CreateLaboratorySettingDetailDto,
    @User('sub')  userId: number
  ) {
    return this.laboratorySettingDetailsService.create(
      createLaboratorySettingDetailDto,
      userId
    );
  }

  @Get('logs')
  getLogs() {
    return this.laboratorySettingDetailsService.getLogs();
  }

  @Get()
  findAll() {
    return this.laboratorySettingDetailsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.laboratorySettingDetailsService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLaboratorySettingDetailDto: UpdateLaboratorySettingDetailDto,
    @User('sub')  userId: number
  ) {
    return this.laboratorySettingDetailsService.update(
      +id,
      updateLaboratorySettingDetailDto,
      userId
    );
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.laboratorySettingDetailsService.remove(+id);
  }
}
