/* eslint-disable prettier/prettier */
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as archiver from 'archiver';
import { Response } from 'express';
import * as puppeteer from 'puppeteer';
import { formatThaiDateWithOutWeekly } from 'src/common/utils/date.util';
import { formatNumber } from 'src/common/utils/format-number.util';
import { Land } from 'src/lands/entities/land.entity';
import { BooksService } from 'src/sample/books/books.service';
 import { Book } from 'src/sample/books/entities/book.entity';
import { SampleStatusEnum } from 'src/sample/enums/qr-code.enum';
import { IsNull, Not, Repository } from 'typeorm';

import { CreateFarmerDto } from './dto/create-farmer.dto';
import { FarmerPublicLoginDto } from './dto/farmer-public-login.dto';
import { FarmerPublicNamePhoneDto } from './dto/farmer-public-name-phone.dto';
import { FarmerPublicProfileDto } from './dto/farmer-public-profile.dto';
import { FarmerSummaryDTO } from './dto/farmer-summary.dto';
import { SearchFarmerDto } from './dto/search-farmer.dto';
import { UpdateFarmerDto } from './dto/update-farmer.dto';
import { Farmer } from './entities/farmer.entity';
import { FarmerLog } from './entities/farmer.log.entity';

interface ReportItem {
  bookId: number;
  sampleCode: string;
  collectSampleAt: number;
  status: SampleStatusEnum;
}

interface SummaryReportItem {
  bookId: number;
  sampleCode: string;
  collectSampleAt: number;
  date: Date;
  status: SampleStatusEnum;
  book: Book;
  results: any;
}

export interface LandWithReports {
  landId: number | null;
  land: Land | null;
  reports: ReportItem[];
}

export interface LandWithSummaryReports {
  landId: number | null;
  land: Land | null;
  reports: SummaryReportItem[];
}

@Injectable()
export class FarmersService {

  constructor(
    @InjectRepository(Farmer)
    private readonly farmerRepo: Repository<Farmer>,

    @InjectRepository(Land)
    private readonly landRepository: Repository<Land>,

    @InjectRepository(FarmerLog)
    private readonly farmerLog: Repository<FarmerLog>,

    @InjectRepository(Book)
    private readonly bookRepo: Repository<Book>,

    private readonly bookService: BooksService,
  ) { }

  private normalizeOptionalDigits(value?: string | null) {
    const digits = String(value ?? '').replace(/\D/g, '');
    return digits || undefined;
  }

  private async assertUniqueThaiNationalId(
    thaiNationalId?: string | null,
    excludeFarmerId?: number,
  ) {
    const normalizedThaiNationalId = this.normalizeOptionalDigits(thaiNationalId);
    if (!normalizedThaiNationalId) return normalizedThaiNationalId;

    const existingFarmer = await this.farmerRepo.findOne({
      where: {
        thaiNationalId: normalizedThaiNationalId,
        ...(excludeFarmerId ? { farmerId: Not(excludeFarmerId) } : {}),
      },
    });

    if (existingFarmer) {
      throw new ConflictException('Farmer with this Thai national ID already exists');
    }

    return normalizedThaiNationalId;
  }

  private digits(v?: string): string {
    return (v ?? '').replace(/\D/g, '');
  }

async create(createFarmerDto: CreateFarmerDto, Uid: number) {
    const thaiNationalId = await this.assertUniqueThaiNationalId(
      createFarmerDto.thaiNationalId,
    );
    const farmer = this.farmerRepo.create({
      ...createFarmerDto,
      thaiNationalId,
    });
    farmer.updateUid = Uid;
    return this.farmerRepo.save(farmer);
  }

  async searchAndPagination(searchFarmerDto: SearchFarmerDto) {
    const {
      search,
      page = 1,
      limit = 10,
      all = false,
      sortBy = 'farmerId',
      order = 'ASC',
    } = searchFarmerDto;

    const validSortFields = [
      'farmerId',
      'firstName',
      'lastName',
      'landCount',
      'landSizeSummary',
      'factoryName',
      'thaiNationalId',
      'phone',
      'serviceAreaName',
      'updatedAt',
    ];
    if (!validSortFields.includes(sortBy)) {
      throw new BadRequestException(`Invalid sortBy value: ${sortBy}`);
    }

    const orderFieldMap = {
      farmerId: 'farmer.farmer_id',
      firstName: 'farmer.first_name',
      lastName: 'farmer.last_name',
      thaiNationalId: 'farmer.thai_national_id',
      phone: 'farmer.phone',
      landCount: 'land_count',
      landSizeSummary: 'land_size_summary',
      factoryName: 'factory_name',
      serviceAreaName: 'service_area_name',
      updatedAt: 'farmer.updated_at',
    };

    const orderField = orderFieldMap[sortBy] || 'farmer.farmer_id';
    const orderDirection = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    let whereClause = '';
    const queryParams: any[] = [];
    if (search) {
      whereClause = `
      WHERE farmer.first_name ILIKE $1 
         OR farmer.last_name ILIKE $1 
         OR farmer.thai_national_id ILIKE $1 
         OR farmer.phone ILIKE $1
    `;
      queryParams.push(`%${search}%`);
    }

    // Query สำหรับข้อมูลหลัก
    const selectQuery = `
    SELECT 
      farmer.farmer_id,
      farmer.thai_national_id,
      farmer.thai_farmer_id,
      farmer.phone,
      farmer.first_name,
      farmer.last_name,
      farmer.line_user_id,
      farmer.factory_id,
      farmer.service_area_id,
      farmer.update_uid,
      farmer.updated_at,

      factory.factory_id AS factory_id,
      factory.name AS factory_name,
      factory.initial AS factory_initial,
      factory.note AS factory_note,

      service_area.service_area_id AS service_area_id,
      service_area.code AS service_area_code,
      service_area.name AS service_area_name,
      service_area.note AS service_area_note,

      COALESCE(land_agg.land_count, 0) AS landCount,
      COALESCE(land_agg.land_size_summary, 0) AS landSizeSummary,

      COUNT(*) OVER () as total_count
    FROM farmers farmer
    LEFT JOIN factories factory ON farmer.factory_id = factory.factory_id
    LEFT JOIN service_areas service_area ON farmer.service_area_id = service_area.service_area_id
    LEFT JOIN (
      SELECT 
        lands.farmer_id,
        COUNT(lands.land_id) as land_count,
        COALESCE(SUM(lands.area_size), 0) as land_size_summary
      FROM lands
      GROUP BY lands.farmer_id
    ) land_agg ON land_agg.farmer_id = farmer.farmer_id
    ${whereClause}
    ORDER BY ${orderField} ${orderDirection}
      ${all ? '' : 'LIMIT $' + (queryParams.length + 1) + ' OFFSET $' + (queryParams.length + 2)}
    `;

    if (!all) {
      queryParams.push(limit, (page - 1) * limit);
    }

    // console.log('Query:', selectQuery);
    // console.log('Params:', queryParams);

    const rawData = await this.farmerRepo.manager.query(selectQuery, queryParams);

    const total = rawData.length > 0 ? parseInt(rawData[0].total_count, 10) : 0;

    // const data = rawData.map(item => ({
    //   ...item,
    //   landCount: parseInt(item.landCount ?? '0', 10),
    //   landSizeSummary: parseFloat(item.landSizeSummary ?? '0'),
    // }));

    const data = rawData.map((item) => {
      const {
        // Farmer fields
        farmer_id,
        thai_national_id,
        thai_farmer_id,
        phone,
        first_name,
        last_name,
        line_user_id,
        factory_id,
        service_area_id,
        update_uid,
        updated_at,

        // Factory fields
        factory_name,
        factory_initial,
        factory_note,

        // ServiceArea fields
        service_area_code,
        service_area_name,
        service_area_note,

        // Aggregated fields
        landcount,
        landsizesummary,
        total_count,
      } = item;

      return {
        farmerId: farmer_id,
        thaiNationalId: thai_national_id,
        thaiFarmerId: thai_farmer_id,
        phone,
        firstName: first_name,
        lastName: last_name,
        lineUserId: line_user_id,
        factoryId: factory_id,
        serviceAreaId: service_area_id,
        updateUid: update_uid,
        updatedAt: parseInt(updated_at),

        landCount: parseInt(landcount ?? '0', 10),
        landSizeSummary: parseFloat(landsizesummary ?? '0'),

        factory: {
          factoryId: factory_id,
          name: factory_name,
          initial: factory_initial,
          note: factory_note,
        },

        serviceArea: {
          serviceAreaId: service_area_id,
          code: service_area_code,
          name: service_area_name,
          note: service_area_note,
        },
      };
    });


    return {
      data,
      total,
      page,
      limit: all ? total : limit,
      totalPages: all ? 1 : Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    return await this.farmerRepo
      .createQueryBuilder('farmer')
      .where('farmer.farmer_id = :id', { id })
      .leftJoinAndSelect('farmer.factory', 'factory')
      .leftJoinAndSelect('farmer.serviceArea', 'serviceArea')
      .leftJoinAndSelect('farmer.lands', 'land')
      .leftJoinAndSelect('land.subdistrict', 'subdistrict')
      .leftJoinAndSelect('subdistrict.district', 'district')
      .leftJoinAndSelect('district.province', 'province') // Assuming District has a province relation
      .addSelect(
        (subQuery) =>
          subQuery
            .select('COUNT(land.land_id)')
            .from('lands', 'land')
            .where('land.farmer_id = farmer.farmer_id'),
        'landCount',
      )
      .addSelect(
        (subQuery) =>
          subQuery
            .select('COALESCE(SUM(land.area_size), 0)')
            .from('lands', 'land')
            .where('land.farmer_id = farmer.farmer_id'),
        'landSizeSummary',
      )
      .getRawAndEntities()
      .then(
        (result) =>
          result.entities.map((entity, index) => ({
            ...entity,
            landCount: parseInt(result.raw[index].landCount, 10),
            landSizeSummary: parseFloat(result.raw[index].landSizeSummary),
          }))[0],
      );
  }

  async update(id: number, updateFarmerDto: UpdateFarmerDto, Uid: number) {
    const farmer = await this.farmerRepo.findOneBy({ farmerId: id });
    if (!farmer) {
      throw new NotFoundException('Farmer not found');
    }
    const thaiNationalId =
      updateFarmerDto.thaiNationalId === undefined
        ? farmer.thaiNationalId
        : await this.assertUniqueThaiNationalId(
          updateFarmerDto.thaiNationalId,
          id,
        );
    Object.assign(farmer, updateFarmerDto, { thaiNationalId, updateUid: Uid });

    return this.farmerRepo.save(farmer);
  }

  async remove(id: number) {
    const userId = 99; // mockUid

    const farmer = await this.farmerRepo.findOneBy({ farmerId: id });
    if (!farmer) {
      throw new NotFoundException('Farmer not found');
    }

    (farmer as any).removedBy = userId;

    try {
      await this.farmerRepo.remove(farmer);
    } catch (error) {
      // Check if it's a foreign key constraint violation
      if (error.code === '23503') {
        throw new BadRequestException(
          'ไม่สามารถลบเกษตรกรได้ เนื่องจากมีข้อมูลที่เกี่ยวข้องอยู่ในระบบ (เช่น ตัวอย่างดินที่ถูกส่งวิเคราะห์)'
        );
      }
      // Re-throw other errors
      throw error;
    }
  }

  

  /**
   * ล็อกอินแบบ Public: ยืนยันตัวตนด้วย
   * - thai_national_id "หรือ" thai_farmer_id
   * - และ phone (ทั้งสองอย่างต้องตรง)
   */
  async publicLogin(dto: FarmerPublicLoginDto): Promise<FarmerPublicProfileDto> {
    const phoneDigits = this.digits(dto.phone);
    if (!phoneDigits || phoneDigits.length < 9) {
      throw new BadRequestException('Invalid phone number');
    }

    // โหลดความสัมพันธ์ด้วย leftJoinAndSelect เพื่อให้มีข้อมูล factory/serviceArea ใน entity
    const qb = this.farmerRepo.createQueryBuilder('farmer')
      .leftJoinAndSelect('farmer.factory', 'factory')
      .leftJoinAndSelect('farmer.serviceArea', 'serviceArea')
      .where('farmer.phone = :phone', { phone: phoneDigits })
      .limit(2);

    const matches = await qb.getMany();
    if (matches.length === 0) {
      throw new NotFoundException('ไม่พบข้อมูลเกษตรกรจากเบอร์โทรศัพท์ที่ระบุ');
    }
    if (matches.length > 1) {
      throw new BadRequestException('พบข้อมูลซ้ำหลายรายการ กรุณาติดต่อเจ้าหน้าที่');
    }

    const farmer = matches[0];

    // ตรวจสอบวันเกิด (ถ้าใน DB ไม่มีวันเกิด ให้บันทึกข้อมูลวันเกิดที่กรอกเข้ามาเป็นครั้งแรก)
    if (!farmer.birthDate) {
      farmer.birthDate = dto.birthDate;
      await this.farmerRepo.save(farmer);
    } else {
      if (farmer.birthDate !== dto.birthDate) {
        throw new BadRequestException('วันเกิดไม่ถูกต้อง');
      }
    }

    // รวมสรุปที่ดิน
    const agg = await this.landRepository.createQueryBuilder('land')
      .select('COUNT(land.land_id)', 'landCount')
      .addSelect('COALESCE(SUM(land.area_size),0)', 'landSizeSummary')
      .where('land.farmer_id = :fid', { fid: farmer.farmerId })
      .getRawOne<any>();

    // บางเวอร์ชันของ TypeORM/PG จะให้คีย์เป็นตัวพิมพ์เล็ก
    const landCount = parseInt((agg?.landcount ?? agg?.landCount ?? '0'), 10);
    const landSizeSummary = parseFloat((agg?.landsizesummary ?? agg?.landSizeSummary ?? '0'));
    const lands = await this.landRepository.find({
      where: { farmerId: farmer.farmerId },
      relations: {
        subdistrict: {
          district: {
            province: true,
          },
        },
      },
    });

    // สร้าง payload ตอบกลับ
    const resp: FarmerPublicProfileDto = {
      farmerId: farmer.farmerId,
      firstName: farmer.firstName,
      lastName: farmer.lastName,
      phone: farmer.phone,
      birthDate: farmer.birthDate,
      thaiFarmerId: farmer.thaiFarmerId || undefined,
      factory: farmer.factory ? {
        factoryId: farmer.factoryId,
        name: farmer.factory?.name ?? null,
        initial: farmer.factory?.initial ?? null,
      } : undefined,
      serviceArea: farmer.serviceArea ? {
        serviceAreaId: farmer.serviceAreaId,
        code: farmer.serviceArea?.code ?? null,
        name: farmer.serviceArea?.name ?? null,
      } : undefined,
      landCount,
      landSizeSummary,
      lands: lands.map(land => ({
        landId: land.landId,
        landCode: land.landCode,
        name: land.name,
        areaSize: land.areaSize,
        latitude: land.latitude,
        longitude: land.longitude,
        subdistrictCode: land.subdistrictCode,
        zipCode: land.subdistrict.zipCode,
        subdistrict: land.subdistrict ? {
          code: land.subdistrict.code,
          zipCode: land.subdistrict.zipCode,
          latitude: land.subdistrict.latitude,
          longitude: land.subdistrict.longitude,
          district: land.subdistrict.district ? {
            code: land.subdistrict.district.code,
            province: land.subdistrict.district.province ? {
              code: land.subdistrict.district.province.code,
            } : undefined,
          } : undefined,
        } : undefined,
      })),
    };

    return resp;
  }

  async publicLookupByNamePhone(dto: FarmerPublicNamePhoneDto): Promise<FarmerPublicProfileDto> {
    const phoneDigits = this.digits(dto.phone);
    const birthDate = dto.birthDate?.trim();
    if (!birthDate) {
      throw new BadRequestException('Invalid birth date');
    }
    if (!phoneDigits || phoneDigits.length < 9) {
      throw new BadRequestException('Invalid phone number');
    }

    const matches = await this.farmerRepo.createQueryBuilder('farmer')
      .leftJoinAndSelect('farmer.factory', 'factory')
      .leftJoinAndSelect('farmer.serviceArea', 'serviceArea')
      .where('farmer.birthDate = :birthDate', { birthDate })
      .andWhere('farmer.phone = :phone', { phone: phoneDigits })
      .limit(2)
      .getMany();

    if (matches.length === 0) {
      throw new NotFoundException('ไม่พบข้อมูลเกษตรกรจากวันเกิดและเบอร์โทรที่ให้มา');
    }
    if (matches.length > 1) {
      throw new BadRequestException('พบข้อมูลซ้ำหลายรายการ กรุณาติดต่อเจ้าหน้าที่');
    }

    const farmer = matches[0];
    const agg = await this.landRepository.createQueryBuilder('land')
      .select('COUNT(land.land_id)', 'landCount')
      .addSelect('COALESCE(SUM(land.area_size),0)', 'landSizeSummary')
      .where('land.farmer_id = :fid', { fid: farmer.farmerId })
      .getRawOne<any>();

    const landCount = parseInt((agg?.landcount ?? agg?.landCount ?? '0'), 10);
    const landSizeSummary = parseFloat((agg?.landsizesummary ?? agg?.landSizeSummary ?? '0'));
    const lands = await this.landRepository.find({
      where: { farmerId: farmer.farmerId },
      relations: {
        subdistrict: {
          district: {
            province: true,
          },
        },
      },
    });

    return {
      farmerId: farmer.farmerId,
      firstName: farmer.firstName,
      lastName: farmer.lastName,
      phone: farmer.phone,
      birthDate: farmer.birthDate,
      thaiFarmerId: farmer.thaiFarmerId || undefined,
      factory: farmer.factory ? {
        factoryId: farmer.factoryId,
        name: farmer.factory?.name ?? null,
        initial: farmer.factory?.initial ?? null,
      } : undefined,
      serviceArea: farmer.serviceArea ? {
        serviceAreaId: farmer.serviceAreaId,
        code: farmer.serviceArea?.code ?? null,
        name: farmer.serviceArea?.name ?? null,
      } : undefined,
      landCount,
      landSizeSummary,
      lands: lands.map(land => ({
        landId: land.landId,
        landCode: land.landCode,
        name: land.name,
        areaSize: land.areaSize,
        latitude: land.latitude,
        longitude: land.longitude,
        subdistrictCode: land.subdistrictCode,
        zipCode: land.zipCode,
        subdistrict: land.subdistrict ? {
          code: land.subdistrict.code,
          zipCode: land.subdistrict.zipCode,
          latitude: land.subdistrict.latitude,
          longitude: land.subdistrict.longitude,
          district: land.subdistrict.district ? {
            code: land.subdistrict.district.code,
            province: land.subdistrict.district.province ? {
              code: land.subdistrict.district.province.code,
            } : undefined,
          } : undefined,
        } : undefined,
      })),
    };
  }

  async getSummary() {
    const farmers = await this.farmerRepo.find();
    const lands = await this.landRepository.find();

    const farmerSummary: FarmerSummaryDTO = {
      totalFarmers: farmers.length,
      totalLands: lands.length,
      totalSpaces: 0
    }

    lands.forEach((land) => {
      farmerSummary.totalSpaces += land.areaSize;
    })

    return farmerSummary;
  }

  getLogs() {
    return this.farmerLog.find();
  }

  /**
   * Service ใหม่สำหรับดึงข้อมูลรายงานทั้งหมดของเกษตรกร โดยจัดกลุ่มตามแปลง
   * @param farmerId ไอดีของเกษตรกร
   * @returns ข้อมูลแปลงและรายงานในแต่ละแปลง
   */
  async getFarmerReportsByLand(farmerId: number): Promise<LandWithReports[]> {
    // 1. ค้นหาแปลงทั้งหมดของเกษตรกรคนนี้
    const lands = await this.landRepository.find({
      where: { farmerId },
    });

    // 2. ค้นหา Books (ผลวิเคราะห์) ทั้งหมดของเกษตรกรคนนี้
    // [FIX] เพิ่มเงื่อนไข qrCodeId: Not(IsNull()) เพื่อดึงเฉพาะที่มีการจับคู่ QR Code แล้ว
    const books = await this.bookRepo.find({
      where: {
        farmerId,
        qrCodeId: Not(IsNull()), // กรองเอาเฉพาะที่มี QR Code (ไม่ใช่แค่การจองเปล่าๆ)
      },
      relations: ['qrCode'],
      order: {
        collectSampleAt: 'DESC',
      },
    });

    // 3. สร้างโครงสร้างข้อมูล
    const landsWithReports: LandWithReports[] = lands.map(land => ({
      landId: land.landId,
      land,
      reports: [],
    }));

    const landMap = new Map(landsWithReports.map(l => [l.landId, l]));

    // 4. วนลูปเพื่อนำ Book ไปใส่ในแต่ละแปลง
    const unassignedReports: ReportItem[] = [];
    for (const book of books) {
      // [Safe Guard] เช็คอีกชั้นเผื่อ database integrity มีปัญหา
      if (!book.qrCode) continue;

      const reportData: ReportItem = {
        bookId: book.bookId,
        sampleCode: book.sampleCode,
        collectSampleAt: book.collectSampleAt,
        status: book.qrCode.status,
      };

      if (book.landId) {
        const landEntry = landMap.get(book.landId);
        if (landEntry) {
          landEntry.reports.push(reportData);
        } else {
          unassignedReports.push(reportData);
        }
      } else {
        unassignedReports.push(reportData);
      }
    }

    // 5. รวมผลลัพธ์
    const result: LandWithReports[] = [...landMap.values()];

    if (unassignedReports.length > 0) {
      result.push({
        landId: null,
        land: null,
        reports: unassignedReports,
      });
    }

    return result;
  }

  async getFarmerSummaryReportsByLand(landId: number): Promise<LandWithSummaryReports[]> {
    // 1. ค้นหาแปลงทั้งหมดของเกษตรกรคนนี้
    const lands = await this.landRepository.find({
      where: { landId },
      relations: {
        subdistrict: {
          district: {
            province: true,
          }
        },
        farmer: {
          factory: true,
          serviceArea: true,
        }
      }
    });

    // 2. ค้นหา Books (ผลวิเคราะห์) ทั้งหมดของเกษตรกรคนนี้
    const books = await this.bookRepo.find({
      where: { landId, qrCodeId: Not(IsNull()) },
      relations: {
        qrCode: true,
        analysisServiceCalendar: true,
        farmer: true
      },
      order: {
        analysisServiceCalendar: {
          date: 'DESC',
        },
      },
    });

    // 3. สร้างโครงสร้างข้อมูล โดยกำหนด Type ให้ชัดเจน
    const landsWithReports: LandWithSummaryReports[] = lands.map(land => ({
      landId: land.landId,
      land,
      reports: [], // ตอนนี้ TypeScript รู้แล้วว่าเป็น Array ของ ReportItem
    }));

    const landMap = new Map(landsWithReports.map(l => [l.landId, l]));

    // 4. วนลูปเพื่อนำ Book ไปใส่ในแต่ละแปลง
    const unassignedReports: SummaryReportItem[] = [];
    for (const book of books) {
      if (!book.qrCode) continue;
      let result: any;
      if (book.qrCode.status === SampleStatusEnum.APPROVED) {
        const reports = await this.bookService.getReports([book.sampleCode]);
        result = reports[0] ?? null;
      }
      const reportData: SummaryReportItem = {
        bookId: book.bookId,
        sampleCode: book.sampleCode,
        date: book.analysisServiceCalendar?.date || null,
        collectSampleAt: book.collectSampleAt,
        status: book.qrCode.status,
        results: result || null,
        book, // เพิ่มข้อมูล book เต็มๆ เข้าไปใน reportData
      };


      if (book.landId) {
        // แก้ไขการตรวจสอบ 'undefined'
        const landEntry = landMap.get(book.landId);
        if (landEntry) {
          landEntry.reports.push(reportData);
        } else {
          unassignedReports.push(reportData);
        }
      } else {
        unassignedReports.push(reportData);
      }
    }

    // 5. รวมผลลัพธ์
    const result: LandWithSummaryReports[] = [...landMap.values()];

    if (unassignedReports.length > 0) {
      result.push({
        landId: null, // Type ตรงกับ LandWithSummaryReports แล้ว
        land: null,
        reports: unassignedReports,
      });
    }
    return result;
  }

  async generateLandReportPdf(landId: number, res: Response) {
    const reports = await this.getFarmerSummaryReportsByLand(landId);
    if (!reports || reports.length === 0) {
      throw new NotFoundException('No reports found to generate PDF.');
    }

    const browser = await puppeteer.launch({ headless: 'new' as any, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const imageBase64 = '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';

    const archive = archiver('zip', {
      zlib: { level: 8 }
    });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="reports.zip"`);
    archive.pipe(res);

    for (const land of reports) {
      if (!land.reports || land.reports.length === 0) continue;
      const latestReport = land.reports[0];
      const html = `
          <html lang="en">
            <head>
              <style>
              @import url('https://fonts.googleapis.com/css2?family=Sarabun&display=swap');
                body { font-family: 'Sarabun', sans-serif; font-size: 12px; }
                .container {padding-left: 35px; padding-right:35px; padding-top:30px;}
                .title { text-align:center; font-weight:bold; font-size:16px; background:#0dcaf0; color:#fff; padding:5px; border-radius:10px; }
                table { border-collapse: collapse; width: 100%; margin-top:10px; }
                td, th, tf { border: 1px solid black; padding: 4px; font-size:12px; text-align:center; }
                .footer { display:flex; justify-content:space-around; margin-top:20px; }
                .head { display:flex; align-items:center; gap:10px; margin-bottom:10px; width: 100%; }
                .head img { height:70px; }
                .address {  display: flex; justify-content: flex-end; align-items: end; color: #0a58ca; font-size: 13px;}
                .title { flex-grow:1; padding: 10px; border-radius: 50px; }
                .farmer-info {
                  display: grid;
                  grid-template-columns: repeat(6, 1fr);
              }
              .right {
                  text-align: right;
              }
              .underline {
                  text-decoration: underline;
                  text-underline-offset: 2px;
                  width: 100%;
              }
              .table-label {
                  margin-top: 20px;
                  display: flex;
                  justify-content: space-between;
              }
              .table-label p{
                  font-weight: bold;
                  margin: 0;
              }
              .table-label .note {
                  font-weight: normal;
                  font-size: 11px;
                  }
              .researcher {
                  display: flex;
                  flex-direction: column;
                  text-align: center;
              }
              .researcher p {
                  margin: 5px 2px;
              }
             .dot {
                display: inline-block;
                width: 100%;
                border-bottom: 1px dotted darkgray;
                padding-bottom: 2px;
                text-align: center;
              }
              .farmer-info p {
                  margin: 5px 2px;
                }
              </style>
            </head>
            <body>
              <div class="container">
              <div class="head">
                  <img src="data:image/jpg;base64,${imageBase64}"/>
                  <div class="title">รายงานผลการวิเคราะห์ดิน</div>
              </div>
              <p class="address">บริษัท มิตรผลวิจัย พัฒนาอ้อยและน้ำตาล จำกัด ที่อยู่ 399 หมุ่ 1 ถ.ชุมแพ-ภูเขียว ต.โคกสะอาด อ.ภูเขียว จ.ชัยภูมิ 36110</p>

              <div class="farmer-info">
                  <p style="font-weight: bold;">ชื่อผู้ส่งตัวอย่าง:</p>
                  <p class="dot">${land.land?.farmer.firstName}</p>
                  <p class="dot">${land.land?.farmer.lastName}</p>
                  <p></p>
                  <p class="right" style="font-weight: bold;">รหัสตัวอย่าง:</p>
                  <p class="dot">${latestReport.sampleCode}</p>
                  <p style="font-weight: bold;">สถานที่เก็บตัวอย่าง:</p>
                  <p class="dot">${land.land?.name ?? '-'}</p>
                  <p class="right" style="font-weight: bold;">รหัสแปลง: </p>
                  <p class="dot"> ${land.land?.landCode}</p>
                  <p class="right" style="font-weight: bold;">เขต: </p>
                  <p class="dot"> ${land.land?.farmer.serviceArea.name}</p>
                  <p style="font-weight: bold;">พื้นที่ไร่: </p>
                  <p class="dot"> ${land.land?.areaSize}</p>
                  <p class="right" style="font-weight: bold;">อำเภอ: </p>
                  <p class="dot"> ${land.land?.subdistrict.district.nameTh}</p>
                  <p class="right" style="font-weight: bold;">จังหวัด: </p>
                  <p class="dot"> ${land.land?.subdistrict.district.province.nameTh}</p>
              </div>
            <hr/>
            <div class="farmer-info">
                  <p style="font-weight: bold;">วันที่รับตัวอย่าง:</p>
                  <p class="underline">${formatThaiDateWithOutWeekly(new Date(latestReport.book.sampleReceivedAt))}</p>
                  <p></p>
                  <p style="font-weight: bold;">วันที่ออกรายงานผล:</p>
                  <p class="underline">${formatThaiDateWithOutWeekly(new Date().toString())}</p>
                  <p></p>
              </div>
            <hr/>

            <div class="table-label">
              <p>รายงานผลการวิเคราะห์ดิน</p>
              <p>ระดับความอุดมสมบูรณ์: ${latestReport.results.ferMajorLandScores.find(
        r => r.soilGrade.laboratoryId === null
      )?.soilGradeLevel.scoreName + ' ' || '-'}</p>
            </div>
              <table>
                <tr style="background-color: #cfe2ff;">
                  <th>รายการ</th>
                  <th>หน่วย</th>
                  <th>วิธีวิเคราะห์</th>
                  ${land.reports.map(r => `<th>ผลวิเคราะห์ดิน<br/>(${formatThaiDateWithOutWeekly(r.date)})</th>`).join('')}
                  <th>ระดับ</th>
                </tr>
                ${latestReport.results.results.map(r => `<tr>
                    <td style="font-weight: bold; text-align: left;">${r.laboratorySetting.laboratory.name}</td>
                    <td>${r.laboratorySetting.laboratory.unitAfter}</td>
                    <td>${r.laboratorySetting.laboratory.machineType.type}</td>
                    ${land.reports.map(report => `<td>${formatNumber(report.results.results.find(res => res.laboratoryId === r.laboratoryId)?.postValue)}</td>`).join('')}
                    <td style="background: ${r.resultGradeLevel.color}">${r.resultGradeLevel.scoreName}</td>
                  </tr>`).join('')}

              </table>

            <div class="table-label">
              <p>คำแนะนำการปรับปรุงดิน</p>
            </div>
              <table>
                <tr style="background-color: #cfe2ff;">
                  <th>คำแนะนำการปรับปรุงดิน</th>
                  <th>หน่วย</th>
                  <th>ปริมาณการใช้</th>
                  <th>ประโยชน์</th>
                </tr>
                ${latestReport.results.ferMinorLandUsages.map(r => `<tr>
                    <td style="font-weight: bold;">${r.fertilizerMinor.name}</td>
                    <td>${r.fertilizerMinor.unit.name}/ไร่</td>
                    <td>${formatNumber(r.useRatePerRai)}</td>
                    <td>${r.fertilizerMinor.benefit}</td>
                  </tr>`).join('')}
              </table>

           <div class="table-label">
              <p>คำแนะนำการใช้ปุ๋ยเคมี</p>
              <p class="note">หมายเหตุ : ปรับปรุงความเป็นกรดของดิน ให้เลือกระหว่างปูนขาว หรือโดโลไมท์ อย่างใดอย่างหนึ่ง</p>
            </div>

            <table border="1" cellspacing="0" cellpadding="4" style="border-collapse: collapse; width:100%;">
              <thead>
                <tr style="background-color: #cfe2ff;">
                  <th style="width:28%">คำแนะนำการใช้ปุ๋ยเคมี</th>
                  ${latestReport.results.serviceType?.serviceCategories.map(cat => `
                    <th style="width:18%">สูตรปุ๋ย ${cat.name}</th>
                    <th style="width:18%">ปริมาณ</th>
                  `).join('')}
                </tr>
              </thead>
              <tbody>
                ${latestReport.results.usageType.map(usageType => {
        const foundUsage = latestReport.results.ferMajorLandUsages.find(
          u => u.serviceFertilizerMajorUsage?.usageTypeId === usageType.usageTypeId
        );
        const usageTypeName = foundUsage ? usageType.name : '';

        return `
                    <tr>
                      <td style="font-weight: bold; text-align: left;">${usageTypeName || '-'}</td>
                      ${latestReport.results.serviceType?.serviceCategories.map(cat => {
          const item = latestReport.results.ferMajorLandUsages.find(
            i => i.serviceFertilizerMajorUsage?.usageTypeId === usageType.usageTypeId &&
              i.serviceFertilizerMajorUsage?.serviceCategoryId === cat.serviceCategoryId
          );

          return `
                          <td>${item?.formula || '-'}</td>
                          <td>${item?.useRate
              ? `${formatNumber(item.useRate)} ${item.serviceFertilizerMajorUsage?.fertilizerMajor?.unit?.name}ต่อไร่`
              : '-'}</td>
                        `;
        }).join('')}
                    </tr>
                  `;
      }).join('')}
              </tbody>
              <tfoot>
                <tr style="background-color: #cfe2ff;">
                  <td>ต้นทุนปุ๋ยเคมี (บาท/ไร่)</td>
                  ${latestReport.results.serviceType?.serviceCategories.map(cat => {
        const item = latestReport.results.ferMajorLandUsages.find(
          i => i.serviceFertilizerMajorUsage?.serviceCategoryId === cat.serviceCategoryId
        );
        return `
                      <td></td>
                      <td>${formatNumber(item?.costPerRai ?? null)}</td>
                    `;
      }).join('')}
                </tr>
              </tfoot>
            </table>

              <div class="footer">
                  <div class="researcher">
                      <p style="font-weight: bold;">ผู้รายงาน</p>
                      <p class="dot">นางสาวจิรัชญา สีลาบัว</p>
                      <p style="font-weight: bold;">(ผู้ช่วยนักวิจัยรถหมอดิน)</p>
                  </div>
                  <div class="researcher">
                      <p style="font-weight: bold;">ผู้ตราจสอบ</p>
                      <p class="dot">คุณจำนาญ โคตรภูเวียง</p>
                      <p style="font-weight: bold;">(ผู้จัดการฝ่ายปฏิบัติเทคโนโลยีอ้อย)</p>
                  </div>
                  <div class="researcher">
                      <p style="font-weight: bold;">ที่ปรึกษา</p>
                      <p class="dot">รศ.ดร ธนภัทรสกรณ์ สุกิจประภานนท์</p>
                      <p style="font-weight: bold;">(อาจารย์/ผู้เชี่ยวชาญด้านปฐพีศาสตร์)</p>
                  </div>
              </div>
              </div>

            </body>
          </html>
        `;
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
      await page.close();
      const filename = `${latestReport.book.farmer.firstName}_${latestReport.book.farmer.lastName}_${latestReport.book.farmer.serviceArea.code}_${latestReport.book.farmer.factory.initial}.pdf`;
      archive.append(Buffer.from(pdfBuffer), { name: filename });
    }

    await browser.close();
    archive.finalize();
  }

}
