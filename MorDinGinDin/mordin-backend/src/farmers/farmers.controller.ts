import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { FarmersService } from './farmers.service';
import { CreateFarmerDto } from './dto/create-farmer.dto';
import { UpdateFarmerDto } from './dto/update-farmer.dto';
import { SearchFarmerDto } from './dto/search-farmer.dto';
import { AuthGuard, RequestWithAuth } from 'src/auth/auth.guard';
import { User } from 'src/auth/decorators/user.decorator';
import { FarmerPublicLoginDto } from './dto/farmer-public-login.dto';
import { Response } from 'express';

@Controller('farmers')
export class FarmersController {
  constructor(private readonly farmersService: FarmersService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createFarmerDto: CreateFarmerDto , @User('sub')  userId: number) {
    return this.farmersService.create(createFarmerDto, userId);
  }

  @Post('by-farmer')
  createByFarmer(@Body() createFarmerDto: CreateFarmerDto) {
    return this.farmersService.create(createFarmerDto, null);
  }

  @Get()
  searchFarmers(@Req() req: RequestWithAuth, @Query() searchFarmerDto: SearchFarmerDto) {
    console.log('Request User:', req.user); // todo: remove this it example for auth
    return this.farmersService.searchAndPagination(searchFarmerDto);
  }

  @Get('/log')
  getLogs() {
    return this.farmersService.getLogs();
  }
  // ✅ ล็อกอินสำหรับ Public: ไม่ต้องใช้ JWT
  @Post('public-login')
  async publicLogin(@Body() dto: FarmerPublicLoginDto) {
    return this.farmersService.publicLogin(dto);
  }

  @Get('/summary')
  getSummary() {
    return this.farmersService.getSummary();
  }

  @Get(':id/reports-by-land')
  getPublicFarmerReports(@Param('id', ParseIntPipe) id: number) {
    return this.farmersService.getFarmerReportsByLand(id);
  }

  @Get('summary/:landId/reports-by-land')
  getSummaryReport(@Param('landId', ParseIntPipe) landId: number) {
    return this.farmersService.getFarmerSummaryReportsByLand(landId);
  }

  @Post('land-report/:landId/pdf')
  async generateLandReportPdf(
    @Param('landId', ParseIntPipe) landId: number,
    @Res() res: Response,
  ) {
    return this.farmersService.generateLandReportPdf(landId, res);
  }

  @Get('land-summary-report/:landId/pdf')
  async generateLandSummaryReportPdf(
    @Param('landId', ParseIntPipe) landId: number,
    @Res() res: Response,
  ) {
    return this.farmersService.generateLandSummaryReportPdf(landId, res);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.farmersService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFarmerDto: UpdateFarmerDto, @User('sub')  userId: number) {
    return this.farmersService.update(+id, updateFarmerDto, userId);
  }

  @Patch('by-farmer/:id')
  updateByFarmer(@Param('id', ParseIntPipe) id: number, @Body() updateFarmerDto: UpdateFarmerDto) {
    return this.farmersService.update(id, updateFarmerDto, null);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.farmersService.remove(+id);
  } 
}
