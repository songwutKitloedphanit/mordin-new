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
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { FarmersService } from './farmers.service';
import { CreateFarmerDto } from './dto/create-farmer.dto';
import { UpdateFarmerDto } from './dto/update-farmer.dto';
import { SearchFarmerDto } from './dto/search-farmer.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/auth/decorators/user.decorator';
import { FarmerPublicLoginDto } from './dto/farmer-public-login.dto';
import { FarmerPublicNamePhoneDto } from './dto/farmer-public-name-phone.dto';
import { Response } from 'express';

@Controller('farmers')
export class FarmersController {
  constructor(private readonly farmersService: FarmersService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createFarmerDto: CreateFarmerDto , @User('sub')  userId: number) {
    return this.farmersService.create(createFarmerDto, userId);
  }

  @Get()
  searchFarmers(@Query() searchFarmerDto: SearchFarmerDto) {
    return this.farmersService.searchAndPagination(searchFarmerDto);
  }

  @Get('/log')
  getLogs() {
    return this.farmersService.getLogs();
  }
  // ✅ สมัครสำหรับ Public: เกษตรกรลงทะเบียนเอง ไม่ต้องใช้ JWT
  // ใช้ create() เดิม โดย Uid ตกเป็น default (system, userId=1) ตามคอลัมน์ update_uid
  @Post('public-register')
  async publicRegister(@Body() createFarmerDto: CreateFarmerDto) {
    return this.farmersService.create(createFarmerDto, 1);
  }

  // ✅ ล็อกอินสำหรับ Public: ไม่ต้องใช้ JWT
  @Post('public-login')
  async publicLogin(@Body() dto: FarmerPublicLoginDto) {
    return this.farmersService.publicLogin(dto);
  }

  @Post('public-lookup-by-name-phone')
  async publicLookupByNamePhone(@Body() dto: FarmerPublicNamePhoneDto) {
    return this.farmersService.publicLookupByNamePhone(dto);
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.farmersService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFarmerDto: UpdateFarmerDto, @User('sub')  userId: number) {
    return this.farmersService.update(+id, updateFarmerDto, userId);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.farmersService.remove(+id);
  } 
}
