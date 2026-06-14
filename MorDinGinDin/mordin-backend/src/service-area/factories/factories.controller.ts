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
import { FactoriesService } from './factories.service';
import { CreateFactoryDto } from './dto/create-factory.dto';
import { UpdateFactoryDto } from './dto/update-factory.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/auth/decorators/user.decorator';

@Controller('factories')
export class FactoriesController {
  constructor(private readonly factoriesService: FactoriesService) { }
  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body() createFactoryDto: CreateFactoryDto,
    @User('sub') userId: number
  ) {
    return this.factoriesService.create(createFactoryDto, userId);
  }

  @Get()
  findAll() {
    return this.factoriesService.findAll();
  }

  @Get('/summary')
  getSummary() {
    return this.factoriesService.getSummary();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.factoriesService.findOne(+id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: number, @Body() updateFactoryDto: UpdateFactoryDto, @User('sub') userId: number) {
    return this.factoriesService.update(id, updateFactoryDto, userId);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.factoriesService.remove(+id);
  }
  @Get('/logs')
  getLogs() {
    return this.factoriesService.getLogs();
  }
}
