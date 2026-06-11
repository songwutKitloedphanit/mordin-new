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
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/auth/decorators/user.decorator';

import { CreateMachineTypeDto } from './dto/create-machine-type.dto';
import { UpdateMachineTypeDto } from './dto/update-machine-type.dto';
import { MachineTypesService } from './machine-types.service';

@Controller('machine-types')
export class MachineTypesController {
  constructor(private readonly machineTypesService: MachineTypesService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body() createMachineTypeDto: CreateMachineTypeDto,
    @User('sub') userId: number
  ) {
    return this.machineTypesService.create(createMachineTypeDto, userId);
  }

  @Get('/logs')
  getLogs() {
    return this.machineTypesService.getLogs();
  }

  @Get()
  findAll() {
    return this.machineTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.machineTypesService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMachineTypeDto: UpdateMachineTypeDto,
    @User('sub') userId: number
  ) {
    return this.machineTypesService.update(+id, updateMachineTypeDto, userId);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.machineTypesService.remove(+id);
  }
}
