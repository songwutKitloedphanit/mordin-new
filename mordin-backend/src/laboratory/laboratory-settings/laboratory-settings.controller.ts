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
import { LaboratorySettingsService } from './laboratory-settings.service';
import { CreateLaboratorySettingDto } from './dto/create-laboratory-setting.dto';
import { UpdateLaboratorySettingDto } from './dto/update-laboratory-setting.dto';
import { UpdateLaboratorySettingDetailDto } from '../laboratory-setting-details/dto/update-laboratory-setting-detail.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/auth/decorators/user.decorator';

@Controller('laboratory-settings')
export class LaboratorySettingsController {
  constructor(
    private readonly laboratorySettingsService: LaboratorySettingsService,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createLaboratorySettingDto: CreateLaboratorySettingDto, @User('sub')  userId: number) {
    return this.laboratorySettingsService.create(createLaboratorySettingDto, userId);
  }

  @Get('/logs')
  getLogs() {
    return this.laboratorySettingsService.getLogs();
  }
  
  @Get()
  findAll() {
    return this.laboratorySettingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.laboratorySettingsService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Patch(':labSettingId/working-standard')
  updateWorkingStandard(
    @Param('labSettingId') labSettingId: string,
    @Body()
    updateLaboratorySettingDetailDto: UpdateLaboratorySettingDetailDto[],
    @User('sub')  userId: number
  ) {
    return this.laboratorySettingsService.updateWorkingStandard(
      +labSettingId,
      updateLaboratorySettingDetailDto,
      userId
    );
  }

  @UseGuards(AuthGuard)
  @Patch()
  update(@Body() updateLaboratorySettingDto: UpdateLaboratorySettingDto[], @User('sub')  userId: number) {
    return this.laboratorySettingsService.update(updateLaboratorySettingDto, userId);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.laboratorySettingsService.remove(+id);
  }
}
