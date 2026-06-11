import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Farmer } from 'src/farmers/entities/farmer.entity';
import { Book } from 'src/sample/books/entities/book.entity';
import { FertilizerMajorLandScore } from 'src/sample/fertilizer-major-land-scores/entities/fertilizer-major-land-score.entity';
import { FertilizerMajorLandUsage } from 'src/sample/fertilizer-major-land-usages/entities/fertilizer-major-land-usage.entity';
import { ServiceCalendar } from 'src/service-calendars/entities/service-calendar.entity';
import { DataSource, Repository } from 'typeorm';

import { DashboardFilterDto } from './dto/dashboard-filter.dto';

export interface DashboardSummaryCard {
  totalArea: number;
  totalFarmer: number;
  totalSamples: number;
  totalWorkingDays: number;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,

    @InjectRepository(ServiceCalendar)
    private readonly serviceCalendarRepo: Repository<ServiceCalendar>,

    @InjectRepository(Book)
    private readonly bookRepo: Repository<Book>,

    @InjectRepository(Farmer)
    private readonly farmerRepo: Repository<Farmer>
  ) {}

  /**
   * ค้นหา Book IDs ตามเงื่อนไขที่ระบุใน Filter
   * @param filters - DTO ที่มีเงื่อนไขการกรองต่างๆ
   * @returns Promise<number[]> - Array ของ Book IDs ที่ตรงตามเงื่อนไข
   */
  private async findBookIdsByFilters(
    filters: DashboardFilterDto
  ): Promise<number[]> {
    const query = this.bookRepo
      .createQueryBuilder('book')
      .leftJoin('book.land', 'land')
      .leftJoin('land.subdistrict', 'subdistrict')
      .leftJoin('subdistrict.district', 'district')
      .leftJoin('district.province', 'province')
      .leftJoin('book.farmer', 'farmer');

    // ++ เพิ่มเงื่อนไขกรองตาม serviceTypeId ++
    if (filters.serviceTypeId) {
      query.andWhere('book.serviceTypeId = :serviceTypeId', {
        serviceTypeId: filters.serviceTypeId,
      });
    }

    if (filters.year) {
      const christianYear = filters.year - 543;
      const startDate = new Date(`${christianYear}-01-01`).getTime();
      const endDate = new Date(`${christianYear}-12-31`).getTime();

      query.andWhere(
        `to_timestamp(book.collectSampleAt / 1000) BETWEEN :startDate AND :endDate`,
        {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        }
      );
    }

    if (filters.factoryId) {
      query.andWhere('farmer.factoryId = :factoryId', {
        factoryId: filters.factoryId,
      });
    }

    if (filters.serviceAreaId) {
      query.andWhere('farmer.serviceAreaId = :serviceAreaId', {
        serviceAreaId: filters.serviceAreaId,
      });
    }

    if (filters.provinceCode) {
      query.andWhere('province.code = :provinceCode', {
        provinceCode: filters.provinceCode,
      });
    }

    if (filters.districtCode) {
      query.andWhere('district.code = :districtCode', {
        districtCode: filters.districtCode,
      });
    }

    if (filters.subdistrictCode) {
      query.andWhere('subdistrict.code = :subdistrictCode', {
        subdistrictCode: filters.subdistrictCode,
      });
    }

    query.select('book.bookId', 'bookId');

    const results = await query.getRawMany();

    return results.map(result => result.bookId);
  }

  private transformDataForChart(rawData: any[]) {
    const result = {};

    for (const item of rawData) {
      const { parameter, gradeName, count } = item;
      if (!result[parameter]) {
        result[parameter] = [];
      }
      result[parameter].push({
        label: gradeName,
        value: parseInt(count, 10),
      });
    }

    return result;
    // ผลลัพธ์สุดท้ายที่พร้อมส่งให้ Frontend:
    // {
    //   "OM": [
    //     { "label": "สูงมาก", "value": 35 },
    //     { "label": "สูง", "value": 35 },
    //     ...
    //   ],
    //   "P": [
    //     { "label": "ต่ำ", "value": 40 },
    //     ...
    //   ]
    // }
  }

  /**
   * ดึงและสรุปข้อมูลการแนะนำปุ๋ยสำหรับ Pie Chart
   * @param bookIds - Array ของ Book IDs ที่ผ่านการกรองแล้ว
   * @returns Object ที่มีข้อมูลจัดกลุ่มตาม Service Category และ Usage Type
   */
  private async getFertilizerRecommendationChartData(bookIds: number[]) {
    if (bookIds.length === 0) {
      return {};
    }

    // 1. Query ข้อมูลโดยเริ่มจาก FertilizerMajorLandUsage
    const query = this.dataSource
      .getRepository(FertilizerMajorLandUsage)
      .createQueryBuilder('landUsage')
      .select('category.name', 'serviceCategoryName') // ชื่อหมวดหมู่บริการ (อ้อยปลูก)
      .addSelect('usageType.name', 'usageTypeName') // ชื่อประเภทการใช้ (ปุ๋ยรองพื้น)
      .addSelect('fertilizer.formular', 'formula') // สูตรปุ๋ย (16-16-8)
      .addSelect('COUNT(landUsage.fertilizerMajorLandUsageId)', 'count') // นับจำนวนการแนะนำ

      // --- JOIN ตารางที่เกี่ยวข้อง ---
      .innerJoin('landUsage.serviceFertilizerMajorUsage', 'sfmu')
      .innerJoin('sfmu.serviceCategory', 'category')
      .innerJoin('sfmu.usageType', 'usageType')
      .innerJoin('sfmu.fertilizerMajor', 'fertilizer')

      // --- กรองด้วย bookIds ที่ได้มา ---
      .where('landUsage.bookId IN (:...bookIds)', { bookIds })

      // --- จัดกลุ่มข้อมูล ---
      .groupBy('category.name, usageType.name, fertilizer.formular')
      .orderBy('category.name, usageType.name');

    const rawData = await query.getRawMany();
    // ผลลัพธ์ (rawData) จะมีหน้าตาประมาณนี้:
    // [
    //   { serviceCategoryName: 'อ้อยปลูก', usageTypeName: 'ปุ๋ยรองพื้น', formula: '16-16-8', count: '45' },
    //   { serviceCategoryName: 'อ้อยปลูก', usageTypeName: 'ปุ๋ยรองพื้น', formula: '20-8-8', count: '30' },
    //   { serviceCategoryName: 'อ้อยปลูก', usageTypeName: 'ปุ๋ยแต่งหน้า', formula: '20-8-8', count: '25' },
    //   ...
    // ]

    // 2. แปลงข้อมูลให้อยู่ในรูปแบบที่ Frontend ใช้งานง่าย
    return this.transformFertilizerDataForChart(rawData);
  }

  private transformFertilizerDataForChart(rawData: any[]) {
    const result = {};

    for (const item of rawData) {
      const { serviceCategoryName, usageTypeName, formula, count } = item;

      if (!result[serviceCategoryName]) {
        result[serviceCategoryName] = {};
      }
      if (!result[serviceCategoryName][usageTypeName]) {
        result[serviceCategoryName][usageTypeName] = [];
      }

      result[serviceCategoryName][usageTypeName].push({
        label: formula,
        value: parseInt(count, 10),
      });
    }

    return result;
    // ผลลัพธ์สุดท้ายที่พร้อมส่งให้ Frontend:
    // {
    //   "อ้อยปลูก": {
    //     "ปุ๋ยรองพื้น": [
    //       { "label": "16-16-8", "value": 45 },
    //       { "label": "20-8-8", "value": 30 }
    //     ],
    //     "ปุ๋ยแต่งหน้า": [ ... ]
    //   },
    //   "อ้อยตอ": { ... }
    // }
  }

  async getDashboardData(filters: DashboardFilterDto) {
    console.log('Fetching dashboard data with filters:', filters);

    const bookIds = await this.findBookIdsByFilters(filters);

    // ถ้าไม่เจอข้อมูล ให้ส่งค่าว่างกลับไป
    if (bookIds.length === 0) {
      return {
        summary: {
          totalArea: 0,
          totalFarmer: 0,
          totalSamples: 0,
          totalWorkingDays: 0,
        },
        soilAnalysis: {},
        fertilizerRecommendation: {}, // ส่ง object ว่าง
        soilImprovement: {}, // ส่ง object ว่าง
      };
    }

    // ดึงข้อมูลทั้งสองส่วนพร้อมกันด้วย Promise.all
    const [soilAnalysisData, fertilizerRecommendationData] = await Promise.all([
      this.getSoilAnalysisChartData(bookIds),
      this.getFertilizerRecommendationChartData(bookIds),
    ]);

    // Mock Data (สามารถแทนที่ด้วยข้อมูลจริงได้ในอนาคต)
    const summary = {
      totalArea: 0,
      totalFarmer: await this.farmerRepo.count(),
      totalSamples: bookIds.length,
      totalWorkingDays: await this.serviceCalendarRepo.count(),
    };
    const soilImprovement = {
      lime: { percentage: 24, averageRate: 300 },
      filterCake: { percentage: 18, averageRate: 10 },
    };

    return {
      summary,
      soilAnalysis: soilAnalysisData,
      fertilizerRecommendation: fertilizerRecommendationData,
      soilImprovement,
    };
  }

  async getSoilAnalysisChartData(bookIds: number[]) {
    const query = this.dataSource
      .getRepository(FertilizerMajorLandScore)
      .createQueryBuilder('score')
      .select('grade.parameter', 'parameter') // เลือกชื่อพารามิเตอร์ เช่น 'OM', 'P', 'K'
      .addSelect('level.scoreName', 'gradeName') // เลือกชื่อเกรด เช่น 'สูง', 'ปานกลาง', 'ต่ำ'
      .addSelect('COUNT(score.fertilizerMajorLandScoreId)', 'count') // นับจำนวน
      .innerJoin('score.soilGrade', 'grade')
      .innerJoin('score.soilGradeLevel', 'level')

      // ---- ใส่เงื่อนไขการกรอง Book ตรงนี้ ----
      .where('score.bookId IN (:...bookIds)', { bookIds })

      // ไม่นับ Total Score เข้ามาในการคำนวณรายพารามิเตอร์
      .andWhere('grade.parameter != :totalScoreParam', {
        totalScoreParam: 'Total Score',
      })

      .groupBy('grade.parameter, level.scoreName');

    const rawData = await query.getRawMany();
    // ผลลัพธ์ (rawData) จะมีหน้าตาประมาณนี้:
    // [
    //   { parameter: 'OM', gradeName: 'สูงมาก', count: '35' },
    //   { parameter: 'OM', gradeName: 'สูง', count: '35' },
    //   { parameter: 'P', gradeName: 'ต่ำ', count: '40' },
    //   ...
    // ]

    return this.transformDataForChart(rawData);
  }

  getDashboardSummary() {
    return 'Dashboard Summary';
  }
}
