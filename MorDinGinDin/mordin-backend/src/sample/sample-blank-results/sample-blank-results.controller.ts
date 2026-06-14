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
import { SampleBlankResultsService } from './sample-blank-results.service';
import { CreateSampleBlankResultDto } from './dto/create-sample-blank-result.dto';
import { UpdateSampleBlankResultDto } from './dto/update-sample-blank-result.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/auth/decorators/user.decorator';

@Controller('sample-blank-results')
export class SampleBlankResultsController {
  constructor(
    private readonly sampleBlankResultsService: SampleBlankResultsService,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createSampleBlankResultDto: CreateSampleBlankResultDto, @User('sub')  userId: number) {
    return this.sampleBlankResultsService.create(createSampleBlankResultDto, userId);
  }

  @Get()
  findAll() {
    return this.sampleBlankResultsService.findAll();
  }

  @Get('/logs')
  getLogs() {
    return this.sampleBlankResultsService.getLogs();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sampleBlankResultsService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSampleBlankResultDto: UpdateSampleBlankResultDto,
    @User('sub')  userId: number
  ) {
    return this.sampleBlankResultsService.update(
      +id,
      updateSampleBlankResultDto,
      userId
    );
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sampleBlankResultsService.remove(+id);
  }
}
