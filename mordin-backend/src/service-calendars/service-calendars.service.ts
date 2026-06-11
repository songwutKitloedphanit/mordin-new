import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Laboratory } from 'src/laboratory/laboratories/entities/laboratory.entity';
import { LaboratorySetting } from 'src/laboratory/laboratory-settings/entities/laboratory-setting.entity';
import { LaboratorySettingsService } from 'src/laboratory/laboratory-settings/laboratory-settings.service';
import { Book } from 'src/sample/books/entities/book.entity';
import { SampleStatusEnum } from 'src/sample/enums/qr-code.enum';
import { Brackets, In, MoreThanOrEqual, Repository } from 'typeorm';

import { CreateServiceCalendarDto } from './dto/create-service-calendar.dto';
import { SearchServiceCalendarDto } from './dto/search-service-calendar.dto';
import { ServiceCalendarSummaryDto } from './dto/service-calendar-summary.dto';
import { UpdateServiceCalendarDto } from './dto/update-service-calendar.dto';
import { ServiceCalendar } from './entities/service-calendar.entity';
import { ServiceCalendarLog } from './entities/service-calendar.log.entity';

// ประเภทข้อมูลสำหรับ Status ใหม่ (เพิ่ม 'no_samples')
type SettingStatus = 'set' | 'not_set';
type AnalysisResultStatus =
  | 'complete'
  | 'in_progress'
  | 'not_started'
  | 'no_samples';
type SampleLeftStatus =
  | 'all_available'
  | 'partially_picked'
  | 'all_picked'
  | 'no_samples';
type ApprovedStatus =
  | 'none_approved'
  | 'partially_approved'
  | 'all_proved'
  | 'no_samples';

// ประเภทข้อมูลสำหรับผลลัพธ์สุดท้าย
export type ServiceCalendarWithStatus = ServiceCalendar & {
  settingStatus: SettingStatus;
  analysisResultStatus: AnalysisResultStatus;
  sampleLeftStatus: SampleLeftStatus;
  approvedStatus: ApprovedStatus;
};

@Injectable()
export class ServiceCalendarsService {
  constructor(
    @InjectRepository(ServiceCalendar)
    private serviceCalendarRepo: Repository<ServiceCalendar>,

    @InjectRepository(Laboratory)
    private labRepo: Repository<Laboratory>,

    @InjectRepository(LaboratorySetting)
    private labSettingRepo: Repository<LaboratorySetting>,

    @InjectRepository(Book)
    private bookRepo: Repository<Book>,

    private readonly labSettingsService: LaboratorySettingsService,
    private readonly httpService: HttpService,
    @InjectRepository(ServiceCalendarLog)
    private serviceCalendarLog: Repository<ServiceCalendarLog>
  ) {}

  // Helper function to group data by calendar ID
  private groupDataByCalendarId<T>(items: T[], key: keyof T): Map<number, T[]> {
    const map = new Map<number, T[]>();
    for (const item of items) {
      const id = item[key] as number;
      if (id) {
        if (!map.has(id)) {
          map.set(id, []);
        }
        map.get(id)!.push(item);
      }
    }
    return map;
  }

  async create(
    createServiceCalendarDto: CreateServiceCalendarDto,
    Uid: number
  ) {
    const lat = parseFloat(createServiceCalendarDto.latitude);
    const lng = parseFloat(createServiceCalendarDto.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      throw new Error('Invalid latitude or longitude: must be valid numbers');
    }

    const serviceCalendar = this.serviceCalendarRepo.create({
      ...createServiceCalendarDto,
      latitude: lat,
      longitude: lng,
      updateUid: Uid,
    });

    const savedServiceCalendar =
      await this.serviceCalendarRepo.save(serviceCalendar);

    await this.labSettingsService.createAllFromServiceCalendarId(
      savedServiceCalendar.serviceCalendarId,
      Uid
    );

    return savedServiceCalendar;
  }

  findAll() {
    return this.serviceCalendarRepo.find({
      relations: {
        subdistrict: {
          district: {
            province: true,
          },
        },
        bus: true,
        laboratorySettings: {
          laboratorySettingDetails: true,
          laboratory: {
            machineType: true,
          },
          convertOmSettings: true,
        },
      },
    });
  }

  findOne(id: number) {
    return this.serviceCalendarRepo.findOne({
      where: { serviceCalendarId: id },
      relations: {
        subdistrict: {
          district: {
            province: true,
          },
        },
        bus: true,
        laboratorySettings: {
          laboratorySettingDetails: true,
          laboratory: {
            machineType: true,
          },
          convertOmSettings: true,
        },
      },
      order: {
        laboratorySettings: {
          laboratorySettingId: 'ASC',
        },
      },
    });
  }

  findUpComing() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.serviceCalendarRepo.find({
      where: {
        date: MoreThanOrEqual(today),
      },
      relations: {
        subdistrict: {
          district: {
            province: true,
          },
        },
        bus: true,
        laboratorySettings: {
          laboratorySettingDetails: true,
          laboratory: {
            machineType: true,
          },
        },
      },
      order: {
        date: 'ASC',
      },
    });
  }

  async update(
    id: number,
    updateServiceCalendarDto: UpdateServiceCalendarDto,
    Uid: number
  ) {
    const serviceCalendar = await this.serviceCalendarRepo.findOneBy({
      serviceCalendarId: id,
    });
    if (!serviceCalendar) {
      throw new NotFoundException('ServiceCalendar not found');
    }

    Object.assign(serviceCalendar, updateServiceCalendarDto, {
      updateUid: Uid,
    });

    return this.serviceCalendarRepo.save(serviceCalendar);
  }

  async remove(id: number, userId: number): Promise<void> {
    // 1. Check for relations in Book
    const bookCount = await this.bookRepo.count({
      where: [
        { receivedServiceCalendarId: id },
        { analysisServiceCalendarId: id },
      ],
    });

    if (bookCount > 0) {
      throw new BadRequestException(
        'ไม่สามารถลบได้เนื่องจากปฏิทินนี้มีการจองหรือการวิเคราะห์แล้ว'
      );
    }

    const serviceCalendar = await this.serviceCalendarRepo.findOneBy({
      serviceCalendarId: id,
    });
    if (!serviceCalendar) {
      throw new NotFoundException('serviceCalendar not found');
    }

    // serviceCalendar.removedBy = userId; // Hard delete as per standard

    await this.serviceCalendarRepo.remove(serviceCalendar);
  }

  async searchAndPagination(searchDto: SearchServiceCalendarDto) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'date',
      order = 'DESC',
      search,
      all = false,
      year,
      month,
    } = searchDto;

    const queryBuilder =
      this.serviceCalendarRepo.createQueryBuilder('serviceCalendar');

    // --- JOINS ---
    queryBuilder
      .leftJoinAndSelect('serviceCalendar.subdistrict', 'subdistrict')
      .leftJoinAndSelect('subdistrict.district', 'district')
      .leftJoinAndSelect('district.province', 'province')
      .leftJoinAndSelect('serviceCalendar.bus', 'bus');

    // --- FILTERS (WHERE clauses) ---
    if (search) {
      queryBuilder.andWhere(
        new Brackets(qb => {
          qb.where('bus.busName ILIKE :search', { search: `%${search}%` })
            .orWhere('bus.busNumber ILIKE :search')
            .orWhere('serviceCalendar.village ILIKE :search')
            .orWhere('subdistrict.nameTh ILIKE :search')
            .orWhere('district.nameTh ILIKE :search')
            .orWhere('province.nameTh ILIKE :search');
        })
      );
    }

    if (year) {
      queryBuilder.andWhere(
        'EXTRACT(YEAR FROM "serviceCalendar"."date") = :year',
        { year }
      );
    }

    if (month) {
      queryBuilder.andWhere(
        'EXTRACT(MONTH FROM "serviceCalendar"."date") = :month',
        { month }
      );
    }

    // --- COUNTING ---
    const total = await queryBuilder.getCount();

    // --- SORTING ---
    const orderFieldMap = {
      date: 'serviceCalendar.date',
      busName: 'bus.busName',
      village: 'serviceCalendar.village',
      province: 'province.nameTh',
    };
    const orderField = orderFieldMap[sortBy] || 'serviceCalendar.date';
    queryBuilder.orderBy(orderField, order);

    // --- PAGINATION ---
    if (!all) {
      queryBuilder.skip((page - 1) * limit).take(limit);
    }

    const calendars = await queryBuilder.getMany();

    if (calendars.length === 0) {
      return {
        data: [],
        total,
        page: all ? 1 : page,
        limit: all ? total : limit,
        totalPages: 0,
      };
    }

    // --- คำนวณ 4 สถานะใหม่ ---
    const calendarIds = calendars.map(c => c.serviceCalendarId);

    // ดึงข้อมูลที่เกี่ยวข้องทั้งหมดในครั้งเดียว
    const [labSettings, receivedBooks, analysisBooks] = await Promise.all([
      this.labSettingRepo.find({
        where: { serviceCalendarId: In(calendarIds) },
      }),
      this.bookRepo.find({
        where: { receivedServiceCalendarId: In(calendarIds) },
      }),
      this.bookRepo.find({
        where: { analysisServiceCalendarId: In(calendarIds) },
        relations: ['qrCode'],
      }),
    ]);

    // จัดกลุ่มข้อมูลเพื่อการเข้าถึงที่รวดเร็ว
    const settingsMap = this.groupDataByCalendarId(
      labSettings,
      'serviceCalendarId'
    );
    const receivedBooksMap = this.groupDataByCalendarId(
      receivedBooks,
      'receivedServiceCalendarId'
    );
    const analysisBooksMap = this.groupDataByCalendarId(
      analysisBooks,
      'analysisServiceCalendarId'
    );

    // ประกอบร่างและคำนวณสถานะ
    const dataWithStatus: ServiceCalendarWithStatus[] = calendars.map(
      calendar => {
        const id = calendar.serviceCalendarId;
        const relatedSettings = settingsMap.get(id) || [];
        const relatedReceivedBooks = receivedBooksMap.get(id) || [];
        const relatedAnalysisBooks = analysisBooksMap.get(id) || [];

        // 1. settingStatus
        const settingStatus: SettingStatus =
          relatedSettings.length > 0 &&
          relatedSettings.every(s => s.intercept != null && s.slope != null)
            ? 'set'
            : 'not_set';

        // 2. sampleLeftStatus
        const totalReceived = relatedReceivedBooks.length;
        const totalPicked = relatedReceivedBooks.filter(
          b => b.analysisServiceCalendarId
        ).length;
        let sampleLeftStatus: SampleLeftStatus;
        if (totalReceived === 0) {
          sampleLeftStatus = 'no_samples';
        } else if (totalReceived > 0 && totalPicked === totalReceived) {
          sampleLeftStatus = 'all_picked';
        } else if (totalPicked > 0 && totalPicked < totalReceived) {
          sampleLeftStatus = 'partially_picked';
        } else {
          sampleLeftStatus = 'all_available';
        }

        // 3. analysisResultStatus & 4. approvedStatus
        let analysisResultStatus: AnalysisResultStatus = 'not_started';
        let approvedStatus: ApprovedStatus = 'none_approved';

        const totalAnalysis = relatedAnalysisBooks.length;
        if (totalAnalysis === 0) {
          analysisResultStatus = 'no_samples';
          approvedStatus = 'no_samples';
        } else {
          const approvedCount = relatedAnalysisBooks.filter(
            b => b.qrCode.status === SampleStatusEnum.APPROVED
          ).length;

          // analysisResultStatus
          if (approvedCount === totalAnalysis) {
            analysisResultStatus = 'complete';
          } else {
            analysisResultStatus = 'in_progress';
          }

          // approvedStatus
          if (approvedCount === totalAnalysis) {
            approvedStatus = 'all_proved';
          } else if (approvedCount > 0 && approvedCount < totalAnalysis) {
            approvedStatus = 'partially_approved';
          } else {
            approvedStatus = 'none_approved';
          }
        }

        const calendarWithStatus = calendar as ServiceCalendarWithStatus;
        calendarWithStatus.settingStatus = settingStatus;
        calendarWithStatus.analysisResultStatus = analysisResultStatus;
        calendarWithStatus.sampleLeftStatus = sampleLeftStatus;
        calendarWithStatus.approvedStatus = approvedStatus;

        return calendarWithStatus;
      }
    );

    return {
      data: dataWithStatus,
      total,
      page: all ? 1 : page,
      limit: all ? total : limit,
      totalPages: all ? 1 : Math.ceil(total / limit),
    };
  }

  async resolveShortUrl(shortUrl: string): Promise<string> {
    try {
      const response = await this.httpService.axiosRef.head(shortUrl, {
        maxRedirects: 5,
        validateStatus: (status: number) => status >= 200 && status < 400,
      });

      const finalUrl: string | undefined =
        response.request?.res?.responseUrl || response.headers['location'];

      if (!finalUrl) {
        throw new BadRequestException('ไม่สามารถดึง URL ปลายทางได้');
      }

      return finalUrl;
    } catch (err: any) {
      throw new BadRequestException(
        `ไม่สามารถ resolve URL ได้: ${err.message}`
      );
    }
  }

  async getCalendarSummary(
    searchDto: SearchServiceCalendarDto
  ): Promise<ServiceCalendarSummaryDto> {
    const { year, month } = searchDto;

    // Helper Function: ช่วยสร้างเงื่อนไข WHERE ปีและเดือน (ใช้ซ้ำได้กับทุก query)
    const applyDateFilter = (qb: any, alias: string) => {
      if (year) {
        qb.andWhere(`EXTRACT(YEAR FROM "${alias}"."date") = :year`, { year });
      }
      if (month) {
        qb.andWhere(`EXTRACT(MONTH FROM "${alias}"."date") = :month`, {
          month,
        });
      }
      return qb;
    };

    // 1. หา "ทั้งหมด" (Total Quota) จากตาราง ServiceCalendar
    const quotaQuery = this.serviceCalendarRepo.createQueryBuilder('sc');
    applyDateFilter(quotaQuery, 'sc'); // ใส่ตัวกรอง

    const { sumQuota } = await quotaQuery
      .select('SUM(sc.numberOfSamples)', 'sumQuota')
      .getRawOne();

    const totalSamples = Number(sumQuota || 0);

    // 2. หา "จองวิเคราะห์" (Total Bookings) จากตาราง Book
    // ต้อง Join กลับไปหา ServiceCalendar เพื่อเช็ควันที่
    const bookingQuery = this.bookRepo
      .createQueryBuilder('book')
      .innerJoin('book.receivedServiceCalendar', 'sc'); // Join ความสัมพันธ์

    applyDateFilter(bookingQuery, 'sc'); // ใส่ตัวกรองที่ตาราง sc

    const totalBookings = await bookingQuery.getCount();

    // 3. หา "วิเคราะห์แล้ว" (Analyzed) เฉพาะสถานะ Approved
    const analyzedQuery = this.bookRepo
      .createQueryBuilder('book')
      .innerJoin('book.receivedServiceCalendar', 'sc') // Join เพื่อเช็ควันที่
      .leftJoin('book.qrCode', 'qrCode') // Join เพื่อเช็ค Status
      .where('qrCode.status = :status', { status: SampleStatusEnum.APPROVED });

    applyDateFilter(analyzedQuery, 'sc'); // ใส่ตัวกรองที่ตาราง sc

    const analyzed = await analyzedQuery.getCount();

    // 4. หา "ว่าง" (Remaining)
    const remaining = Math.max(0, totalSamples - totalBookings);

    return {
      totalSamples, // ทั้งหมด (ตามปี/เดือนที่เลือก)
      remaining, // ว่าง
      totalBookings, // จองวิเคราะห์
      analyzed, // วิเคราะห์แล้ว
    };
  }

  async getPublicUpcomingCalendars() {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // เอาเวลาออก ให้เหลือแค่วันที่

    // 1. ดึง Calendar ที่วันที่ >= วันนี้
    const calendars = await this.serviceCalendarRepo.find({
      where: {
        date: MoreThanOrEqual(today),
      },
      relations: {
        bus: true,
        subdistrict: { district: { province: true } },
      },
      order: {
        date: 'ASC',
      },
    });

    // 2. วนลูปเพื่อนับจำนวน Bookings ของแต่ละรอบ
    const result = await Promise.all(
      calendars.map(async cal => {
        const bookingCount = await this.bookRepo.count({
          where: {
            receivedServiceCalendarId: cal.serviceCalendarId,
          },
        });

        // 3. คำนวณว่าเต็มหรือยัง
        // สมมติ numberOfSamples คือโควตาสูงสุด (หรือจะเพิ่ม field quota แยกก็ได้)
        const maxQuota = cal.numberOfBookings || cal.numberOfSamples;
        const isFull = bookingCount >= maxQuota;

        return {
          ...cal,
          currentBookings: bookingCount,
          maxQuota,
          isFull,
          // แปลงวันที่เป็น string ง่ายๆ หรือจะไปแปลงที่ front ก็ได้
          dateStr: cal.date,
        };
      })
    );

    return result;
  }

  getLogs() {
    return this.serviceCalendarLog.find();
  }

  async initSettingsForCalendar(calendarId: number, userId: number) {
    const calendar = await this.serviceCalendarRepo.findOne({
      where: { serviceCalendarId: calendarId },
    });
    if (!calendar)
      throw new NotFoundException(`ServiceCalendar ${calendarId} not found`);

    const existing = await this.labSettingRepo.count({
      where: { serviceCalendarId: calendarId },
    });
    if (existing > 0) {
      return {
        skipped: true,
        message: `Calendar ${calendarId} already has ${existing} settings`,
      };
    }

    await this.labSettingsService.createAllFromServiceCalendarId(
      calendarId,
      userId
    );
    const created = await this.labSettingRepo.count({
      where: { serviceCalendarId: calendarId },
    });
    return {
      skipped: false,
      message: `Created ${created} settings for calendar ${calendarId}`,
    };
  }
}
