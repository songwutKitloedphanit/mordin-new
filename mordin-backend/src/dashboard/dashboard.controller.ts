import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardFilterDto } from './dto/dashboard-filter.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getDashboardData(@Query() filters: DashboardFilterDto) {
    return this.dashboardService.getDashboardData(filters);
  }

  @Get('/summary')
  getDashboardSummary() {
    
  }
}