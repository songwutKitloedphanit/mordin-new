import { Injectable } from '@nestjs/common';
import { CreateFertilizerMajorLandScoreDto } from './dto/create-fertilizer-major-land-score.dto';
import { UpdateFertilizerMajorLandScoreDto } from './dto/update-fertilizer-major-land-score.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FertilizerMajorLandScoreLog } from './entities/fertilizer-major-land-score.log.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Result } from '../results/entities/result.entity';
import { FertilizerMajorLandScore } from './entities/fertilizer-major-land-score.entity';
import { GetGraphFilterDto } from './dto/get-graph-filter.dto';
import { SampleStatusEnum } from '../enums/qr-code.enum';
import {
  ChoroplethMapDataDto,
  DashboardResponseDto,
  FertilizerSummaryResponseDto,
  HorizontalBarChartDataDto,
  PieChartDataDto,
  PrepareDataDto,
  SoilAnalysisDataDto,
} from './dto/graph-data-response.dto';
import { FertilizerMinorLandUsage } from '../fertilizer-minor-land-usages/entities/fertilizer-minor-land-usage.entity';
import { FertilizerMajorLandUsage } from '../fertilizer-major-land-usages/entities/fertilizer-major-land-usage.entity';

@Injectable()
export class FertilizerMajorLandScoresService {
  constructor(
    @InjectRepository(FertilizerMajorLandScore)
    private readonly fertilizerMajorLandScoreRepo: Repository<FertilizerMajorLandScore>,

    @InjectRepository(FertilizerMajorLandScoreLog)
    private fertilizerMajorLandScoreLog: Repository<FertilizerMajorLandScoreLog>,

    @InjectRepository(Result)
    private readonly resultRepo: Repository<Result>
  ) { }
  create(
    createFertilizerMajorLandScoreDto: CreateFertilizerMajorLandScoreDto,
    Uid: number
  ) {
    return 'This action adds a new fertilizerMajorLandScore';
  }

  findAll() {
    return this.fertilizerMajorLandScoreRepo.find({
      relations: {
        result: {
          resultGradeLevel: {
            resultGrade: {
              laboratory: true,
            },
          },
        },
        book: {
          analysisServiceCalendar: true,
          serviceArea: {
            factory: true,
          },
          qrCode: true,
          land: {
            subdistrict: {
              district: {
                province: {
                  geography: true,
                },
              },
            },
          },
          ferMajorLandUsages: {
            serviceFertilizerMajorUsage: {
              serviceCategory: true,
              usageType: true,
            },
          },
          ferMinorLandUsages: {
            fertilizerMinor: {
              unit: true,
            },
          },
        },
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} fertilizerMajorLandScore`;
  }

  update(
    id: number,
    updateFertilizerMajorLandScoreDto: UpdateFertilizerMajorLandScoreDto,
    Uid: number
  ) {
    return `This action updates a #${id} fertilizerMajorLandScore`;
  }

  remove(id: number) {
    return `This action removes a #${id} fertilizerMajorLandScore`;
  }

  async getGraphData(filters: GetGraphFilterDto): Promise<DashboardResponseDto> {

    const soilQuery = this.fertilizerMajorLandScoreRepo
      .createQueryBuilder('score')
      .leftJoin('score.result', 'result')
      .leftJoin('result.resultGradeLevel', 'gradeLevel')
      .leftJoin('gradeLevel.resultGrade', 'grade')
      .leftJoin('grade.laboratory', 'lab')
      .leftJoin('score.book', 'book')
      .leftJoin('book.qrCode', 'qrCode')
      .leftJoin('book.land', 'land')
      .leftJoin('land.subdistrict', 'subdistrict')
      .leftJoin('subdistrict.district', 'district')
      .leftJoin('district.province', 'province')
      .leftJoin('province.geography', 'geography')
      .leftJoin('book.serviceArea', 'serviceArea')
      .leftJoin('book.analysisServiceCalendar', 'analysisServiceCalendar')
      .leftJoin('serviceArea.factory', 'factory');

    let locationSelectColumn = '';

    if (filters.subdistrictCode || filters.serviceAreaId) {
      locationSelectColumn = 'land.village';
    } else if (filters.districtCode) {
      locationSelectColumn = 'subdistrict.nameEn';
    } else if (filters.provinceCode) {
      locationSelectColumn = 'district.nameEn';
    } else if (filters.factoryId) {
      locationSelectColumn = 'serviceArea.code';
    } else if (filters.geographyId) {
      locationSelectColumn = 'province.nameEn';
    } else {
      locationSelectColumn = 'province.nameEn';
    }

    soilQuery.select([
      'lab.shortNameAfter AS element',
      'gradeLevel.scoreName AS grade',
      'gradeLevel.color AS color',
      'gradeLevel.level AS levelOrder',
      'COUNT(score.fertilizerMajorLandScoreId) AS count',
      `${locationSelectColumn} AS "locationName"`,
    ]);

    this.applyCommonFilters(soilQuery, filters);

    soilQuery.andWhere('qrCode.status = :status', { status: SampleStatusEnum.APPROVED });
    soilQuery.andWhere('lab.shortNameAfter IS NOT NULL');
    soilQuery.andWhere('gradeLevel.scoreName IS NOT NULL');
    soilQuery.andWhere(`${locationSelectColumn} IS NOT NULL`);

    soilQuery
      .groupBy(`${locationSelectColumn}`)
      .addGroupBy('lab.shortNameAfter')
      .addGroupBy('gradeLevel.scoreName')
      .addGroupBy('gradeLevel.color')
      .addGroupBy('gradeLevel.level');

    const majorUsageQuery = this.fertilizerMajorLandScoreRepo.manager
      .createQueryBuilder(FertilizerMajorLandUsage, 'majorUsage')
      .leftJoin('majorUsage.serviceFertilizerMajorUsage', 'serviceUsage')
      .leftJoin('serviceUsage.serviceCategory', 'category')
      .leftJoin('serviceUsage.usageType', 'usageType')
      .leftJoin('majorUsage.book', 'book')
      .leftJoin('book.qrCode', 'qrCode')
      .leftJoin('book.land', 'land')
      .leftJoin('land.subdistrict', 'subdistrict')
      .leftJoin('subdistrict.district', 'district')
      .leftJoin('district.province', 'province')
      .leftJoin('province.geography', 'geography')
      .leftJoin('book.serviceArea', 'serviceArea')
      .leftJoin('book.analysisServiceCalendar', 'analysisServiceCalendar');

    this.applyCommonFilters(majorUsageQuery, filters);
    majorUsageQuery.andWhere('qrCode.status = :status', { status: SampleStatusEnum.APPROVED });

    majorUsageQuery.select([
      'category.name AS serviceCategoryName',
      'usageType.name AS usageTypeName',
      'majorUsage.formula AS formula',
      'majorUsage.useRate AS useRate',
      'COUNT(majorUsage.fertilizerMajorLandUsageId) AS count'
    ])
      .groupBy('category.name')
      .addGroupBy('usageType.name')
      .addGroupBy('majorUsage.formula')
      .addGroupBy('majorUsage.useRate');

    const minorUsageQuery = this.fertilizerMajorLandScoreRepo.manager
      .createQueryBuilder(FertilizerMinorLandUsage, 'minorUsage')
      .leftJoin('minorUsage.book', 'book')
      .leftJoin('minorUsage.fertilizerMinor', 'fertMinor')
      .leftJoin('fertMinor.unit', 'unit')
      .leftJoin('book.qrCode', 'qrCode')
      .leftJoin('book.land', 'land')
      .leftJoin('land.subdistrict', 'subdistrict')
      .leftJoin('subdistrict.district', 'district')
      .leftJoin('district.province', 'province')
      .leftJoin('province.geography', 'geography')
      .leftJoin('book.serviceArea', 'serviceArea')
      .leftJoin('book.analysisServiceCalendar', 'analysisServiceCalendar');

    this.applyCommonFilters(minorUsageQuery, filters);
    minorUsageQuery.andWhere('qrCode.status = :status', { status: SampleStatusEnum.APPROVED });

    minorUsageQuery
      .select([
        'minorUsage.fertilizerMinorName AS fertilizerMinorName',
        'unit.name AS unitName',
        'SUM(minorUsage.totalUsage) AS totalUsage',
        'AVG(minorUsage.useRatePerRai) AS useRatePerRai',
        'COUNT(minorUsage.fertilizerMinorLandUsageId) AS count'
      ])
      .groupBy('minorUsage.fertilizerMinorName')
      .addGroupBy('unit.name');

    const [soilRaw, majorRaw, minorRaw] = await Promise.all([
      soilQuery.getRawMany(),
      majorUsageQuery.getRawMany(),
      minorUsageQuery.getRawMany()
    ]);

    const soilAnalysis = this.transformDataByLocation(soilRaw);

    const pieChartData: PieChartDataDto[] = [];
    const prepareData: PrepareDataDto[] = [];

    const majorMap = new Map<string, PieChartDataDto>();

    for (const row of majorRaw) {
      const key = row.servicecategoryname;

      let existingItem = majorMap.get(key);

      if (!existingItem) {
        existingItem = {
          serviceCategoryName: row.servicecategoryname,
          summary: []
        };
        majorMap.set(key, existingItem);
      }

      // หา summary ตาม usageTypeName
      let summaryItem = existingItem.summary.find(
        s => s.usageTypeName === row.usagetypename
      );

      if (!summaryItem) {
        summaryItem = {
          usageTypeName: row.usagetypename,
          PieChartItemDto: []
        };
        existingItem.summary.push(summaryItem);
      }

      summaryItem.PieChartItemDto.push({
        formula: row.formula,
        useRate: Number(row.userate),
        count: Number(row.count)
      });
    }

    pieChartData.push(...majorMap.values());


    const totalUseRatePerRai = minorRaw.reduce(
      (sum, row) => sum + Number(row.userateperrai),
      0
    );

    for (const row of minorRaw) {
      const totalUsage = Number(row.totalusage);
      const useRatePerRai = Number(Number(row.userateperrai).toFixed(2));

      const useRatePercent =
        totalUseRatePerRai > 0
          ? Number(((useRatePerRai / totalUseRatePerRai) * 100).toFixed(2))
          : 0;

      prepareData.push({
        fertilizerMinorName: row.fertilizerminorname,
        unitName: row.unitname,
        totalUsage,
        useRatePerRai,
        useRatePercent
      });
    }

    return {
      soilAnalysis,
      fertilizerSummary: {
        pieChartData,
        prepareData
      }
    };
  }

  private transformDataByLocation(
    rawData: {
      element: string;
      grade: string;
      color: string;
      levelOrder: number;
      count: string;
      locationName: string;
    }[]
  ): SoilAnalysisDataDto[] {
    interface ElementAccumulator {
      elementName: string;
      totalSamplesInElement: number;
      locations: Record<
        string,
        {
          locationName: string;
          totalCount: number;
          grades: {
            gradeName: string;
            color: string;
            count: number;
            order: number;
          }[];
        }
      >;
      gradesSummary: Record<
        string,
        {
          gradeName: string;
          color: string;
          count: number;
          order: number;
        }
      >;
    }

    const groupedByElement = rawData.reduce<Record<string, ElementAccumulator>>(
      (acc, curr) => {
        const element = curr.element || 'Unknown';
        const location = curr.locationName || 'Unknown Location';
        const count = parseInt(curr.count, 10);

        if (!acc[element]) {
          acc[element] = {
            elementName: element,
            totalSamplesInElement: 0,
            locations: {},
            gradesSummary: {},
          };
        }

        // Map Data Accumulation
        if (!acc[element].locations[location]) {
          acc[element].locations[location] = {
            locationName: location,
            totalCount: 0,
            grades: [],
          };
        }
        acc[element].locations[location].grades.push({
          gradeName: curr.grade,
          color: curr.color,
          count: count,
          order: curr.levelOrder,
        });
        acc[element].locations[location].totalCount += count;

        // Bar Chart Accumulation
        if (!acc[element].gradesSummary[curr.grade]) {
          acc[element].gradesSummary[curr.grade] = {
            gradeName: curr.grade,
            color: curr.color,
            count: 0,
            order: curr.levelOrder,
          };
        }
        acc[element].gradesSummary[curr.grade].count += count;
        acc[element].totalSamplesInElement += count;

        return acc;
      },
      {}
    );

    const result = Object.values(groupedByElement).map(
      (el: ElementAccumulator): SoilAnalysisDataDto => {
        // Part A: Map Data
        const mapData: ChoroplethMapDataDto[] = Object.values(el.locations).map(
          loc => {
            loc.grades.sort((a, b) => b.order - a.order);
            const bestGrade = loc.grades[0];

            return {
              locationName: loc.locationName,
              totalCount: loc.totalCount,
              data: {
                gradeName: bestGrade ? bestGrade.gradeName : null,
                color: bestGrade ? bestGrade.color : null,
              },
            };
          }
        );
        mapData.sort((a, b) =>
          a.locationName.localeCompare(b.locationName, 'th')
        );

        // Part B: Bar Chart Data
        const barData: HorizontalBarChartDataDto[] = Object.values(
          el.gradesSummary
        ).map(g => {
          return {
            gradeName: g.gradeName,
            color: g.color,
            count: g.count,
            percentage: ((g.count / el.totalSamplesInElement) * 100).toFixed(1),
            order: g.order,
          };
        });
        barData.sort((a, b) => a.order - b.order);

        // Final Return matching DTO
        return {
          elementName: el.elementName,
          ChoroplethMapData: mapData,
          HorizontalBarChartData: barData,
        };
      }
    );

    result.sort((a, b) => a.elementName.localeCompare(b.elementName));

    return result
  }

  getLogs() {
    return this.fertilizerMajorLandScoreLog.find();
  }

  async getSummaryCards() {
    const scores = await this.fertilizerMajorLandScoreRepo.find({
      relations: {
        book: {
          qrCode: true,
          land: true,
        },
      },
    });

    // set ไว้กันซ้ำ
    const landIds = new Set<number>(); // แปลง (ไร่) ที่ approved
    const approvedBookIds = new Set<number>(); // book ที่ approved
    const farmerIds = new Set<number>(); // ชาวไร่ทั้งหมด
    const serviceCalendarIds = new Set<number>(); // serviceCalendars ทั้งหมด

    for (const score of scores) {
      const book = score.book;
      if (!book) continue;

      const qrCode = book.qrCode;

      // --- 2) farmers ทั้งหมด (นับจากทุก book)
      if (book.farmerId) {
        farmerIds.add(book.farmerId);
      }

      // --- 4) นับ serviceCalendars ทั้งหมด
      // ใช้ qrCode.serviceCalendarId (ถ้าอยากรวม received/analysis ก็ add เข้า set ด้วย)
      if (qrCode?.serviceCalendarId) {
        serviceCalendarIds.add(qrCode.serviceCalendarId);
      }
      if (book.receivedServiceCalendarId) {
        serviceCalendarIds.add(book.receivedServiceCalendarId);
      }
      if (book.analysisServiceCalendarId) {
        serviceCalendarIds.add(book.analysisServiceCalendarId);
      }

      // ส่วนที่เหลือ เฉพาะ QR ที่ approved เท่านั้น
      if (qrCode?.status === SampleStatusEnum.APPROVED) {
        // --- 1) books ที่ qrCode.status = approved ทั้งหมดโดยไม่ซ้ำแปลง
        if (book.landId) {
          landIds.add(book.landId);
        }

        // --- 3) books ทั้งหมดที่ approved
        approvedBookIds.add(book.bookId);
      }
    }

    return {
      landCount: landIds.size, // ไร่
      farmerCount: farmerIds.size, // คน
      sampleCount: approvedBookIds.size, // ตัวอย่าง (book approved ทั้งหมด)
      serviceCalendarCount: serviceCalendarIds.size, // วัน (จำนวน serviceCalendars ทั้งหมด)
    };
  }

  private applyCommonFilters(query: SelectQueryBuilder<any>, filters: GetGraphFilterDto) {
    if (filters.geographyId) query.andWhere('geography.id = :geoId', { geoId: filters.geographyId });
    if (filters.provinceCode) query.andWhere('province.code = :provCode', { provCode: filters.provinceCode });
    if (filters.districtCode) query.andWhere('district.code = :distCode', { distCode: filters.districtCode });
    if (filters.subdistrictCode) query.andWhere('subdistrict.code = :subdistCode', { subdistCode: filters.subdistrictCode });
    if (filters.factoryId) query.andWhere('serviceArea.factoryId = :factoryId', { factoryId: filters.factoryId });
    if (filters.serviceAreaId) query.andWhere('serviceArea.serviceAreaId = :serviceAreaId', { serviceAreaId: filters.serviceAreaId });
    if (filters.typeId) query.andWhere('book.serviceTypeId = :typeId', { typeId: filters.typeId });

    if (filters.year) {
      const yearAD = Number(filters.year) - 543;
      query.andWhere('analysisServiceCalendar.date BETWEEN :start AND :end', {
        start: `${yearAD}-01-01`,
        end: `${yearAD}-12-31`
      });
    }
  }
}
