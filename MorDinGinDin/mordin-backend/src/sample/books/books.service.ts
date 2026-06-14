import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { DataSource, In, IsNull, Not, Repository } from 'typeorm';
import { SampleStatusEnum } from '../enums/qr-code.enum';
import { Result } from '../results/entities/result.entity';
import { QrCode } from '../qr-codes/entities/qr-code.entity';
import { ResultsService } from '../results/results.service';
import { ServiceCalendar } from 'src/service-calendars/entities/service-calendar.entity';
import * as dayjs from 'dayjs';
import { OwnerDataDto } from './dto/owner-data.dto';
import { Land } from 'src/lands/entities/land.entity';
import * as path from 'path';
import { FertilizerMinorLandUsage } from '../fertilizer-minor-land-usages/entities/fertilizer-minor-land-usage.entity';
import { FertilizerMajorLandUsage } from '../fertilizer-major-land-usages/entities/fertilizer-major-land-usage.entity';
import { UsageType } from 'src/fertilizer/usage-types/entities/usage-type.entity';
import { FertilizerMajorLandScore } from '../fertilizer-major-land-scores/entities/fertilizer-major-land-score.entity';
import { BookLog } from './entities/book.log.entity';
import { Response } from 'express';
import * as puppeteer from 'puppeteer';
import { instanceToPlain } from 'class-transformer';
import { report } from 'process';
import { formatThaiDateWithOutWeekly } from 'src/common/utils/date.util';
import { formatNumber } from 'src/common/utils/format-number.util';
import * as archiver from 'archiver';
import * as fs from 'fs';
import { Farmer } from 'src/farmers/entities/farmer.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingByFarmerDto } from './dto/update-booking-by-farmer.dto';
import { MachineTypeTypes } from 'src/laboratory/enums/machine-type.enum';

const hasBrokenDisplayText = (value: unknown) => {
  if (typeof value !== 'string') return true;
  const text = value.trim();
  if (!text) return true;
  return /^\?+$/.test(text) || text.includes('เธ') || text.includes('เน');
};

const getMachineTypeDisplay = (machineType?: {
  name?: string | null;
  type?: string | null;
}) => {
  const machineTypeName = machineType?.name?.trim();
  if (machineTypeName && !hasBrokenDisplayText(machineTypeName)) {
    return machineTypeName;
  }

  switch (machineType?.type) {
    case MachineTypeTypes.RAW_VALUE:
      return 'ค่าดิบ';
    case MachineTypeTypes.REVERSE_LINEAR:
      return 'สมการผกผันรูปแบบที่ 1 (สูตร OM)';
    case MachineTypeTypes.P_COMPLEX:
      return 'สมการผกผันรูปแบบที่ 2 (สูตร P)';
    case MachineTypeTypes.EXTRACT_RATIO:
      return 'สมการผกผันรูปแบบที่ 3 (สูตรทั่วไป)';
    default:
      return '-';
  }
};

const getScoreLevelStyle = (scoreName: unknown) => {
  const normalizedScore = String(scoreName ?? '').replace(/\s+/g, '');

  switch (normalizedScore) {
    case 'สูงมาก':
      return 'background:#1b5e20;color:#ffffff;';
    case 'สูง':
      return 'background:#4caf50;color:#000000;';
    case 'กลาง':
      return 'background:#ffd54f;color:#000000;';
    case 'ต่ำ':
      return 'background:#ffb74d;color:#000000;';
    case 'ต่ำมาก':
      return 'background:#e53935;color:#ffffff;';
    default:
      return 'background:transparent;color:#000000;';
  }
};

@Injectable()
export class BooksService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,

    @InjectRepository(Book)
    private readonly bookRepo: Repository<Book>,

    @InjectRepository(Result)
    private readonly resultRepo: Repository<Result>,

    @InjectRepository(ServiceCalendar)
    private readonly serCalendarRepo: Repository<ServiceCalendar>,

    @InjectRepository(QrCode)
    private readonly qrCodeRepo: Repository<QrCode>,

    @InjectRepository(Land)
    private readonly landRepo: Repository<Land>,

    @InjectRepository(FertilizerMinorLandUsage)
    private readonly ferMinorLandUsageRepo: Repository<FertilizerMinorLandUsage>,

    @InjectRepository(FertilizerMajorLandUsage)
    private readonly ferMajorLandUsageRepo: Repository<FertilizerMajorLandUsage>,

    @InjectRepository(FertilizerMajorLandScore)
    private readonly ferMajorLandScoreRepo: Repository<FertilizerMajorLandScore>,

    @InjectRepository(UsageType)
    private readonly usageTypeRepo: Repository<UsageType>,

    @InjectRepository(BookLog)
    private readonly bookLog: Repository<BookLog>,

    @InjectRepository(Farmer)
    private readonly farmerRepo: Repository<Farmer>,

    private readonly resultService: ResultsService
  ) { }
  create(createBookDto: CreateBookDto) {
    return 'This action adds a new book';
  }

  findAll() {
    return `This action returns all books`;
  }

  async findOne(id: number) {
    const book = await this.bookRepo.findOne({
      where: { bookId: id },
      relations: {
      },
    });
    const results = await this.resultService.findAllByBookId(id);
    const fertilizerMinorLandUsages = await this.ferMinorLandUsageRepo.find({
      where: {
        bookId: id,
      },
      relations: {
        fertilizerMinor: true,
      },
    });
    return {
      ...book,
      results: results,
      fertilizerMinorLandUsages: fertilizerMinorLandUsages,
    }
  }

  async findReceivedBooksByServiceCalendarId(serviceCalendarId: number) {
    const books = await this.bookRepo.find({
      where: {
        receivedServiceCalendarId: serviceCalendarId,
        qrCode: {
          status: Not(SampleStatusEnum.COLLECTED && SampleStatusEnum.DISTRIBUTED),
        }
      },
      relations: {
        qrCode: true,
      },
    });

    const booksWithResults: (Book & { results: Result[] })[] = [];
    for (const book of books) {
      const results = await this.resultRepo.find({
        where: {
          bookId: book.bookId,
        },
        relations: {
          laboratorySetting: {
            laboratorySettingDetails: true,
            laboratory: {
              machineType: true,
            }
          }
        }
      });
      booksWithResults.push({
        ...book,
        results: results
      });
    }

    return booksWithResults;
  }

  /**
   * Find sample by service calendar ID
   * @param serviceCalendarId - The ID of the service calendar
   * @returns A promise that resolves to an array of books
   */

  async findReceivedSamplesByServiceCalendarId(serviceCalendarId: number) {
    const qrCode = await this.qrCodeRepo.find({
      where: {
        book: {
          analysisServiceCalendarId: serviceCalendarId,
        },
        status: Not(SampleStatusEnum.COLLECTED && SampleStatusEnum.DISTRIBUTED),
      },
      relations: {
        book: {
          land: {
            farmer: true,
          },
        },
      },
    });

    let data: { qrCode: QrCode; result: Result[] }[] = [];
    for (const qr of qrCode) {
      const results = await this.resultRepo.find({
        where: {
          bookId: qr.book.bookId,
        },
        relations: {
          laboratorySetting: {
            laboratorySettingDetails: true,
            laboratory: {
              machineType: true,
            },
          },
          resultGradeLevel: true,
        },
        order: {
          repeatNumber: "ASC",
          laboratoryId: "ASC"
        }
      });
      data.push({
        qrCode: qr,
        result: results,
      });
    }

    return data;
  }

  /**
   * [OPTIMIZED] เมธอดที่ปรับปรุงใหม่ทั้งหมด
   */
  async selectReceivedBooksByBookId(serviceCalendarId: number, bookIds: number[], Uid: number) {
    if (!bookIds || bookIds.length === 0) {
      return [];
    }

    // หุ้มการทำงานทั้งหมดด้วย Transaction
    return this.dataSource.transaction(async (manager) => {
      const bookRepo = manager.getRepository(Book);
      const qrCodeRepo = manager.getRepository(QrCode);

      // --- 1. Pre-fetch ข้อมูลที่จำเป็นทั้งหมด ---
      const currentCount = await bookRepo.count({
        where: { analysisServiceCalendarId: serviceCalendarId },
      });

      const booksToUpdate = await bookRepo.find({
        where: { bookId: In(bookIds) },
      });

      // --- 2. เตรียมข้อมูลสำหรับการ Bulk Update ใน Memory ---
      const updatedBooks: Book[] = [];
      const updatedQrCodes: Partial<QrCode>[] = [];

      for (let i = 0; i < booksToUpdate.length; i++) {
        const book = booksToUpdate[i];
        const newAnalysisNumber = currentCount + i + 1;
        const repeatCount = newAnalysisNumber % 15 === 0 ? 3 : 1;

        // เตรียมข้อมูล Book ที่จะอัปเดต
        book.analysisServiceCalendarId = serviceCalendarId;
        book.sampleAnalysisNumber = newAnalysisNumber;
        book.repeatCount = repeatCount; // ต้องกำหนดค่านี้ให้ book object เพื่อส่งต่อ
        updatedBooks.push(book);

        // เตรียมข้อมูล QrCode ที่จะอัปเดต
        updatedQrCodes.push({
          qrCodeId: book.qrCodeId,
          status: SampleStatusEnum.ANALYZING,
        });
      }

      // --- 3. Bulk Save ข้อมูลที่เปลี่ยนแปลง ---
      // บันทึก Books ก่อน
      const savedBooks = await bookRepo.save(updatedBooks);

      // บันทึก QrCodes
      // TypeORM's save can work like update if primary key is provided
      await qrCodeRepo.save(updatedQrCodes);

      // --- 4. เรียกใช้ Service สร้าง blank results แบบ Bulk ---
      await this.resultService.createBlankResultsForBooksBulk(savedBooks, manager);

      return savedBooks;
    });
  }

  createBookByQrCode(qrCodeId: number) {
    const book = this.bookRepo.create({
      qrCodeId,
    });
    return this.bookRepo.save(book);
  }

  async settingOwnerData(bookId: number, data: OwnerDataDto, Uid: number) {
    const book = await this.bookRepo.findOne({
      where: { bookId }
    });
    if (!book) {
      throw new NotFoundException('Book not found');
    };

    const { farmerId, landId, serviceTypeId } = data;
    if (landId) {
      const land = await this.landRepo.findOne({
        where: { landId },
      });
      if (!land) {
        throw new NotFoundException('Land not found');
      }

      if (land.farmerId !== farmerId) {
        throw new NotFoundException('Farmer does not own this land');
      }

      if (data.latitude !== undefined && data.longitude !== undefined) {
        if (land.latitude === null || land.latitude === undefined ||
          land.longitude === null || land.longitude === undefined) {
          Object.assign(land, {
            latitude: isNaN(Number(data.latitude)) ? undefined : parseFloat(data.latitude),
            longitude: isNaN(Number(data.longitude)) ? undefined : parseFloat(data.longitude),
            updateUid: Uid, // Mock update UID
          });
          await this.landRepo.save(land);
        }
      }

      Object.assign(book, {
        farmerId: farmerId,
        landId: land.landId,
        latitude: land.latitude,
        longitude: land.longitude,
        areaSize: land.areaSize,
      });
    }

    Object.assign(book, {
      serviceTypeId: serviceTypeId,
      updateUid: 1, // Mock update UID
    })
    return this.bookRepo.save(book);
  }

  async findSamplesForReportPage(serviceCalendarId: number) {
    const qrCode = await this.qrCodeRepo.find({
      where: {
        book: {
          analysisServiceCalendarId: serviceCalendarId,
        },
        status: Not(SampleStatusEnum.COLLECTED && SampleStatusEnum.DISTRIBUTED),
      },
      relations: {
        book: {
          land: true,
          farmer: true,
        },
      },
    });

    let data: { qrCode: QrCode; totalResult: number, analyzedResult: number }[] = [];
    for (const qr of qrCode) {
      let totalResult: number = 0;
      let analyzedResult: number = 0;
      const results = await this.resultRepo.find({
        where: {
          bookId: qr.book.bookId,
        },
      });

      totalResult = results.length;
      analyzedResult = results.filter(result =>
        result.postValue !== null &&
        result.postValue !== undefined &&
        result.postValue !== 0
      ).length;
      data.push({
        qrCode: qr,
        totalResult: totalResult,
        analyzedResult: analyzedResult
      });
    }

    return data;
  }

  /**
   * [OPTIMIZED] ปรับปรุงใหม่โดยการแยก Query เพื่อแก้ปัญหา Cartesian Explosion
   */
  // async getReports(bookIds: number[]): Promise<any[]> {
  async getReports(sampleCodes: string[]): Promise<any[]> {
    if (!sampleCodes || sampleCodes.length === 0) {
      throw new NotFoundException('No Sample Codes provided.');
    }

    // STEP 1: Query หา Book entities ด้วย sampleCodes
    const books = await this.bookRepo.find({
      where: { sampleCode: In(sampleCodes) },
      relations: {
        land: { subdistrict: { district: { province: true } } },
        farmer: {
          factory: true,
          serviceArea: true,
        },
        serviceType: { serviceCategories: true },
        qrCode: true,
        analysisServiceCalendar: true,
      },
    });

    if (books.length === 0) {
      throw new NotFoundException(`No books found for Sample Codes: ${sampleCodes.join(', ')}`);
    }

    // [แก้ไข] รวบรวม bookId จาก books ที่เราหาเจอใน STEP 1
    const bookIds = books.map(book => book.bookId);

    // STEP 2: Fetch ข้อมูล Collection ทั้งหมดโดยใช้ bookIds ที่ได้มา
    const [
      results,
      ferMajorLandUsages,
      ferMinorLandUsages,
      ferMajorLandScores, // แก้ไขชื่อตัวแปร
      usageTypes
    ] = await Promise.all([
      // Query for Results
      this.resultRepo.find({
        where: { bookId: In(bookIds) }, // <-- ใช้ bookIds
        relations: { resultGradeLevel: true, laboratorySetting: { laboratory: { machineType: true } } },
      }),
      // Query for Major Usages and their nested relations
      this.ferMajorLandUsageRepo.find({
        where: { bookId: In(bookIds) }, // <-- ใช้ bookIds
        relations: {
          serviceFertilizerMajorUsage: { fertilizerMajor: { unit: true } },
        },
      }),
      // Query for Minor Usages
      this.ferMinorLandUsageRepo.find({
        where: { bookId: In(bookIds) }, // <-- ใช้ bookIds
        relations: { fertilizerMinor: { unit: true } },
      }),
      // Query for Major Land Score
      this.ferMajorLandScoreRepo.find({
        where: { bookId: In(bookIds) }, // <-- ใช้ bookIds
        relations: { soilGrade: true, soilGradeLevel: true }
      }),
      // Fetch all usage types once
      this.usageTypeRepo.find(),
    ]);

    // STEP 3: จัดกลุ่มข้อมูล Collection ที่ได้มาใส่ใน Map (เหมือนเดิม)
    const groupById = (items, idField) => {
      const map = new Map();
      for (const item of items) {
        const key = item[idField];
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(item);
      }
      return map;
    };

    const resultsMap = groupById(results, 'bookId');
    const ferMajorUsagesMap = groupById(ferMajorLandUsages, 'bookId');
    const ferMinorUsagesMap = groupById(ferMinorLandUsages, 'bookId');
    const ferMajorLandScoreMap = groupById(ferMajorLandScores, 'bookId'); // แก้ไขชื่อตัวแปร

    // STEP 4: ประกอบร่างข้อมูลทั้งหมดเข้าด้วยกัน (เหมือนเดิม)
    const reports = books.map(book => {
      return {
        ...book,
        results: resultsMap.get(book.bookId) ?? [],
        ferMajorLandUsages: ferMajorUsagesMap.get(book.bookId) ?? [],
        ferMinorLandUsages: ferMinorUsagesMap.get(book.bookId) ?? [],
        ferMajorLandScores: ferMajorLandScoreMap.get(book.bookId) ?? [], // แก้ไขชื่อ property
        usageType: usageTypes,
      };
    });

    return reports;
  }

  async getSummaryReports(bookId: number): Promise<any[]> {
    // STEP 1: Query หา Book entities
    const books = await this.bookRepo.find({
      where: {
        bookId,
        qrCode: {
          status: SampleStatusEnum.APPROVED, // <--- เพิ่มเงื่อนไขที่นี่
        },
      },
      relations: {
        // land: { subdistrict: { district: { province: true } } },
        // farmer: {
        //   factory: true,
        //   serviceArea: true,
        // },
        // serviceType: { serviceCategories: true },
        qrCode: true,
      },
    });

    if (books.length === 0) {
      throw new NotFoundException(`No books found for Book: ${bookId}`);
    }

    // รวบรวม bookId จาก books ที่เราหาเจอ
    const bookIds = books.map(book => book.bookId);

    // STEP 2: Fetch ข้อมูล Results และ FerMajorLandScores โดยใช้ bookIds
    const [results, ferMajorLandScores] = await Promise.all([
      this.resultRepo.find({
        where: { bookId: In(bookIds) },
        relations: { resultGradeLevel: true, laboratorySetting: { laboratory: { machineType: true } } },
      }),
      this.ferMajorLandScoreRepo.find({
        where: { bookId: In(bookIds) },
        relations: { soilGrade: true, soilGradeLevel: true },
      }),
    ]);

    // STEP 3: จัดกลุ่มข้อมูลที่ได้มาใส่ใน Map
    const groupById = (items: any[], idField: string) => {
      const map = new Map<number, any[]>();
      for (const item of items) {
        const key = item[idField];
        if (!map.has(key)) {
          map.set(key, []);
        }
        map.get(key)!.push(item);
      }
      return map;
    };

    const resultsMap = groupById(results, 'bookId');
    const ferMajorLandScoreMap = groupById(ferMajorLandScores, 'bookId');

    // STEP 4: ประกอบร่างข้อมูลทั้งหมดเข้าด้วยกัน
    const reports = books.map(book => {
      return {
        // ...book, // นำข้อมูล book กลับมา เพื่อให้รู้ว่า result และ score เป็นของ book ไหน
        results: resultsMap.get(book.bookId) ?? [],
        ferMajorLandScores: ferMajorLandScoreMap.get(book.bookId) ?? [],
      };
    });

    return reports;
  }

  async generatePdf(reports: any[], res: Response) {
    if (!reports || reports.length === 0) {
      throw new NotFoundException('No reports found to generate PDF.');
    }

    const browser = await puppeteer.launch({
      headless: 'new' as any,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--allow-file-access-from-files',
      ],
    });

    const logoPath = path.join(
      __dirname,
      '..',
      '..',
      'assets',
      'images',
      'mitrphol_research.png'
    );
    const imageBase64 = fs.readFileSync(logoPath).toString('base64');
    const logoDataUri = `data:image/png;base64,${imageBase64}`;
    const fontPath = path.join(
      __dirname,
      '..',
      '..',
      'assets',
      'fonts',
      'sarabun',
      'Sarabun-Regular.ttf'
    );
    const sarabunFontBase64 = fs.readFileSync(fontPath).toString('base64');
    const FAKE_BASE64_PLACEHOLDER = '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';

    const archive = archiver('zip', {
      zlib: { level: 8 }
    });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="reports.zip"`);
    archive.pipe(res);

    const safeText = (value: unknown, fallback = '-') => {
      if (value === null || value === undefined || value === '') return fallback;
      return String(value);
    };

    const safeDate = (value: string | Date | null | undefined) => {
      if (!value) return '-';
      return formatThaiDateWithOutWeekly(value);
    };

    for (const report of reports) {
      const page = await browser.newPage();
      const results = report.results ?? [];
      const ferMinorLandUsages = report.ferMinorLandUsages ?? [];
      const ferMajorLandUsages = report.ferMajorLandUsages ?? [];
      const serviceCategories = report.serviceType?.serviceCategories ?? [];
      const usageTypes = report.usageType ?? [];
      const overallScore =
        report.ferMajorLandScores?.find(r => r.soilGrade?.laboratoryId === null)
          ?.soilGradeLevel?.scoreName ?? '-';
      const html = `
          <html lang="en">
            <head>
              <style>
                @font-face {
                  font-family: 'Sarabun';
                  src: url(data:font/truetype;charset=utf-8;base64,${sarabunFontBase64}) format('truetype');
                  font-weight: 400;
                  font-style: normal;
                }
                body { font-family: 'Sarabun', Arial, sans-serif; font-size: 12px; }
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
                  <img src="${logoDataUri}"/>
                  <div class="title">รายงานผลการวิเคราะห์ดิน</div>
              </div>
              <p class="address">บริษัท มิตรผลวิจัย พัฒนาอ้อยและน้ำตาล จำกัด ที่อยู่ 399 หมุ่ 1 ถ.ชุมแพ-ภูเขียว ต.โคกสะอาด อ.ภูเขียว จ.ชัยภูมิ 36110</p>

              <div class="farmer-info">
                  <p style="font-weight: bold;">ชื่อผู้ส่งตัวอย่าง:</p>
                  <p class="dot">${safeText(report.farmer?.firstName)}</p>
                  <p class="dot">${safeText(report.farmer?.lastName)}</p>
                  <p></p>
                  <p class="right" style="font-weight: bold;">รหัสตัวอย่าง:</p>
                  <p class="dot">${safeText(report.sampleCode)}</p>
                  <p style="font-weight: bold;">สถานที่เก็บตัวอย่าง:</p>
                  <p class="dot">${safeText(report.land?.name)}</p>
                  <p class="right" style="font-weight: bold;">รหัสแปลง: </p>
                  <p class="dot"> ${safeText(report.land?.landCode)}</p>
                  <p class="right" style="font-weight: bold;">เขต: </p>
                  <p class="dot"> ${safeText(report.farmer?.factory?.name)}</p>
                  <p style="font-weight: bold;">พื้นที่ไร่: </p>
                  <p class="dot"> ${safeText(report.land?.areaSize)}</p>
                  <p class="right" style="font-weight: bold;">อำเภอ: </p>
                  <p class="dot"> ${safeText(report.land?.subdistrict?.district?.nameTh)}</p>
                  <p class="right" style="font-weight: bold;">จังหวัด: </p>
                  <p class="dot"> ${safeText(report.land?.subdistrict?.district?.province?.nameTh)}</p>
              </div>
            <hr/>
            <div class="farmer-info">
                  <p style="font-weight: bold;">วันที่รับตัวอย่าง:</p>
                  <p class="underline">${safeDate(report.sampleReceivedAt)}</p>
                  <p></p>
                  <p style="font-weight: bold;">วันที่ออกรายงานผล:</p>
                  <p class="underline">${formatThaiDateWithOutWeekly(new Date().toString())}</p>
                  <p></p>
              </div>
            <hr/>

            <div class="table-label">
              <p>รายงานผลการวิเคราะห์ดิน</p>
              <p>ระดับความอุดมสมบูรณ์: ${overallScore}</p>
            </div>
              <table>
                <tr style="background-color: #cfe2ff;">
                  <th>รายการ</th>
                  <th>หน่วย</th>
                  <th>วิธีวิเคราะห์</th>
                  <th>ผลวิเคราะห์ดิน</th>
                  <th>ระดับ</th>
                </tr>
                ${results.map(r => `<tr>
                    <td style="font-weight: bold; text-align: left;">${safeText(r.laboratorySetting?.laboratory?.name)}</td>
                    <td>${safeText(r.laboratorySetting?.laboratory?.unitAfter)}</td>
                    <td>${safeText(getMachineTypeDisplay(r.laboratorySetting?.laboratory?.machineType))}</td>
                    <td>${formatNumber(r.postValue)}</td>
                    <td style="${getScoreLevelStyle(r.resultGradeLevel?.scoreName)}">${safeText(r.resultGradeLevel?.scoreName)}</td>
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
                ${ferMinorLandUsages.map(r => `<tr>
                    <td style="font-weight: bold;">${safeText(r.fertilizerMinor?.name)}</td>
                    <td>${safeText(r.fertilizerMinor?.unit?.name)}/ไร่</td>
                    <td>${formatNumber(r.useRatePerRai)}</td>
                    <td>${safeText(r.fertilizerMinor?.benefit)}</td>
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
                  ${serviceCategories.map(cat => `
                    <th style="width:18%">สูตรปุ๋ย ${safeText(cat.name)}</th>
                    <th style="width:18%">ปริมาณ</th>
                  `).join('')}
                </tr>
              </thead>
              <tbody>
                ${usageTypes.map(usageType => {
        // หาชื่อประเภทการใช้ (เช่น พืชหลัก/พืชร่วม ฯลฯ)
        const foundUsage = ferMajorLandUsages.find(
          u => u.serviceFertilizerMajorUsage?.usageTypeId === usageType.usageTypeId
        );
        const usageTypeName = foundUsage ? usageType.name : '';

        return `
                    <tr>
                      <td style="font-weight: bold; text-align: left;">${usageTypeName || '-'}</td>
                      ${serviceCategories.map(cat => {
          const item = ferMajorLandUsages.find(
            i => i.serviceFertilizerMajorUsage?.usageTypeId === usageType.usageTypeId &&
              i.serviceFertilizerMajorUsage?.serviceCategoryId === cat.serviceCategoryId
          );

          return `
                          <td>${item?.formula || '-'}</td>
                          <td>${item?.useRate
              ? `${formatNumber(item.useRate)} ${safeText(item.serviceFertilizerMajorUsage?.fertilizerMajor?.unit?.name)}ต่อไร่`
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
                  ${serviceCategories.map(cat => {
        const item = ferMajorLandUsages.find(
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

      await page.setContent(html, { waitUntil: 'domcontentloaded' });
      const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
      await page.close();

      const filename = `${report.farmer?.firstName}_${report.farmer?.lastName}_${report.farmer?.serviceArea?.code}_${report.farmer?.factory?.initial}.pdf`;
      archive.append(Buffer.from(pdfBuffer), { name: filename });
    }

    await browser.close();
    archive.finalize();
  }

  async generateSummaryReportByLandPdf(landSummary: any, res: Response) {
    const { pdfBuffer, filename } = await this.buildSummaryReportByLandPdf(landSummary);

    const archive = archiver('zip', {
      zlib: { level: 8 }
    });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="reports.zip"`);
    archive.pipe(res);
    archive.append(Buffer.from(pdfBuffer), { name: filename });
    archive.finalize();
  }

  async buildSummaryReportByLandPdf(landSummary: any): Promise<{ pdfBuffer: Buffer; filename: string }> {
    const yearsSet = new Set<number>();
    const labMap: Record<number, { labName: string; posts: Record<number, number | string> }> = {};
    const summaryEntry = landSummary?.[0];
    const land = summaryEntry?.land;
    const farmer = land?.farmer;
    const safeText = (value: unknown) => {
      if (value === null || value === undefined) return '-';
      const text = String(value).trim();
      return text.length > 0 ? text : '-';
    };
    const getReportDateValue = (report: any, reportPayload?: any) =>
      report?.collectSampleAt ??
      report?.book?.collectSampleAt ??
      report?.date ??
      report?.analysisServiceCalendar?.date ??
      reportPayload?.analysisServiceCalendar?.date ??
      report?.book?.analysisServiceCalendar?.date ??
      reportPayload?.sampleReceivedAt ??
      report?.book?.sampleReceivedAt ??
      null;
    const toDate = (value: unknown) => {
      if (!value) return null;
      const date = new Date(typeof value === 'number' || /^\d+$/.test(String(value)) ? Number(value) : String(value));
      return Number.isNaN(date.getTime()) ? null : date;
    };

    summaryEntry?.reports?.forEach(report => {
      const reportPayload = Array.isArray(report.results) ? report.results[0] : report.results;
      const reportDate = toDate(getReportDateValue(report, reportPayload));
      if (reportPayload?.results) {
        report.results = reportPayload.results.map(result => ({
          ...result,
          recordedAt: result.recordedAt ?? reportDate?.getTime(),
        }));
      }
    });

    summaryEntry?.reports?.forEach(report => {
      if (!report.results) return; // ข้ามถ้า results เป็น null/undefined

      report.results.forEach(r => {
        // ข้ามถ้าไม่มี laboratorySetting หรือ laboratory
        const labSetting = r.laboratorySetting;
        const lab = labSetting?.laboratory;
        if (!lab) return; // ข้ามถ้า laboratory เป็น undefined

        const year = new Date(Number(r.recordedAt)).getFullYear();
        yearsSet.add(year);

        const labId = lab.laboratoryId ?? 0;
        const labName = lab.name ?? 'ไม่ระบุ';

        if (!labMap[labId]) {
          labMap[labId] = { labName, posts: {} };
        }

        labMap[labId].posts[year] = r.postValue;
      });
    });


    const years = Array.from(yearsSet).sort((a, b) => b - a);
    const labs = Object.values(labMap);


    const logoPath = path.join(__dirname, '..', '..', 'assets', 'images', 'mitrphol_research.png');
    const logoDataUri = `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`;
    const browser = await puppeteer.launch({ headless: 'new' as any, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const imageBase64 = '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';

    const page = await browser.newPage();
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
                  <img src="${logoDataUri}"/>
                  <div class="title">รายงานผลการวิเคราะห์ดิน</div>
              </div>
              <p class="address">บริษัท มิตรผลวิจัย พัฒนาอ้อยและน้ำตาล จำกัด ที่อยู่ 399 หมุ่ 1 ถ.ชุมแพ-ภูเขียว ต.โคกสะอาด อ.ภูเขียว จ.ชัยภูมิ 36110</p>

              <div class="farmer-info">
                  <p style="font-weight: bold;">ชื่อผู้ส่งตัวอย่าง:</p>
                  <p class="dot">${safeText(farmer?.firstName)}</p>
                  <p class="dot">${safeText(farmer?.lastName)}</p>
                  <p></p>
                  <p class="right" style="font-weight: bold;"></p>
                  <p></p>
                  <p style="font-weight: bold;">สถานที่เก็บตัวอย่าง:</p>
                  <p class="dot">${safeText(land?.name)}</p>
                  <p class="right" style="font-weight: bold;">รหัสแปลง: </p>
                  <p class="dot"> ${safeText(land?.landCode)}</p>
                  <p class="right" style="font-weight: bold;">เขต: </p>
                  <p class="dot"> ${safeText(farmer?.factory?.name)}</p>
                  <p style="font-weight: bold;">พื้นที่ไร่: </p>
                  <p class="dot"> ${safeText(land?.areaSize)}</p>
                  <p class="right" style="font-weight: bold;">อำเภอ: </p>
                  <p class="dot"> ${safeText(land?.subdistrict?.district?.nameTh)}</p>
                  <p class="right" style="font-weight: bold;">จังหวัด: </p>
                  <p class="dot"> ${safeText(land?.subdistrict?.district?.province?.nameTh)}</p>
                  <p style="font-weight: bold;">เบอร์ติดต่อ: </p>
                  <p class="dot"> ${safeText(farmer?.phone)}</p>
              </div>
            <hr/>
           

            <div class="table-label">
              <p>รายงานผลการวิเคราะห์ดิน</p>
              <p>ระดับความอุดมสมบูรณ์ดิน:</p> 
            </div>
              <table>
                <tr style="background-color: #cfe2ff;">
                  <th>รายการ</th>
                  ${years.map((y, i) => `<th>${y}</th>`).join('')}
                </tr>
                <tbody>
                ${(labs.length === 0 ? [{ labName: 'ไม่มีข้อมูลผลวิเคราะห์', posts: {} }] : labs).map(lab => `
                  <tr>
                    <td>${lab.labName}</td>
                    ${years.map(y => `<td>${lab.posts[y] ?? '-'}</td>`).join('')}
                  </tr>
                `).join('')}
                </tbody>

              </table>

            </div>

            </body>
          </html>
        `;

    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await page.close();

    const filename = `${safeText(farmer?.firstName)}_${safeText(farmer?.lastName)}_${safeText(land?.landCode)}_${safeText(farmer?.serviceArea?.code)}_${safeText(farmer?.factory?.initial)}.pdf`;

    await browser.close();
    return {
      pdfBuffer: Buffer.from(pdfBuffer),
      filename,
    };
  }

  async createBooking(dto: CreateBookingDto) {
    //
    // 1.
    // ตรวจสอบการจองซ้ำ
    // ตรวจสอบว่าเกษตรกรจองแปลงนี้ในรอบบริการนี้ไปแล้วหรือไม่
    // (อนุญาตให้จองหลายแปลงในวันเดียวกันได้)
    const existingBook = await this.bookRepo.findOne({
      where: {
        farmerId: dto.farmerId,
        landId: dto.landId,
        receivedServiceCalendarId: dto.receivedServiceCalendarId,
      },
    });

    if (existingBook) {
      throw new BadRequestException('คุณได้ทำการจองแปลงนี้ในรอบบริการนี้ไปแล้ว');
    }

    //
    // 2.
    // ตรวจสอบ
    // Land
    // (Optional
    // แต่ควรทำ)
    const land = await this.landRepo.findOneBy({ landId: dto.landId, farmerId: dto.farmerId });
    if (!land) {
      throw new NotFoundException('ไม่พบแปลงปลูก หรือแปลงนี้ไม่ใช่ของคุณ');
    }

    //
    // 3.
    // สร้าง
    // Book
    const book = this.bookRepo.create({
      receivedServiceCalendarId: dto.receivedServiceCalendarId,
      farmerId: dto.farmerId,
      landId: dto.landId,
      serviceTypeId: dto.serviceTypeId,
      bookedAt: Date.now(),
    });

    return await this.bookRepo.save(book);
  }

  // 2. ดึงรายชื่อคนจอง ตาม ServiceCalendarId (สำหรับเจ้าหน้าที่ดู)
  async findBookingsByCalendarId(calendarId: number) {
    return await this.bookRepo.find({
      where: {
        receivedServiceCalendarId: calendarId,
        qrCodeId: IsNull(), // ดึงเฉพาะที่ยังไม่ได้จับคู่
      },
      relations: ['farmer', 'land', 'serviceType'],
      order: { bookedAt: 'ASC' }
    });
  }

  // 3. ฟังก์ชันจับคู่ Booking กับ QR Code (สำหรับเจ้าหน้าที่)
  async pairBookingWithQrCode(bookId: number, qrCodeString: string) {
    // หา Booking
    const book = await this.bookRepo.findOne({ where: { bookId } });
    if (!book) throw new NotFoundException('Booking not found');

    // ถอดรหัส QR (ถ้าส่งมาแบบ Encrypt ให้ Decrypt ที่ Controller หรือที่นี่)
    // สมมติว่า qrCodeString คือค่าที่ Decrypt แล้ว หรือ Raw String
    let qrCode = await this.qrCodeRepo.findOne({ where: { qrCode: qrCodeString } });

    if (!qrCode) {
      throw new NotFoundException('QR Code not found');
      // หรือจะเลือก create new QR ตรงนี้เลยก็ได้ถ้าเป็นถุงเปล่าใหม่เอี่ยม
    }

    if (qrCode.status !== SampleStatusEnum.DISTRIBUTED) {
      // แจ้งเตือนถ้า QR นี้ถูกใช้ไปแล้ว
      // throw new BadRequestException('QR Code is already used');
    }

    // อัปเดตข้อมูล
    book.qrCode = qrCode;
    book.sampleReceivedAt = Date.now();
    // Gen Sample Code ตรงนี้ด้วย (Copy logic จาก receiveQrCodeSample มาใส่)

    // อัปเดตสถานะ QR
    qrCode.status = SampleStatusEnum.RECEIVED;

    await this.qrCodeRepo.save(qrCode);
    return await this.bookRepo.save(book);
  }

  getLogs() {
    return this.bookLog.find();
  }

  async updateBooking(bookId: number, updateBookingDto: UpdateBookingByFarmerDto) {
    const book = await this.bookRepo.findOne({
      where: { bookId },
      relations: ['qrCode'],
    });

    if (!book) {
      throw new NotFoundException('Booking not found');
    }

    if (book.farmerId !== updateBookingDto.farmerId) {
      throw new UnauthorizedException('You are not authorized to modify this booking');
    }

    if (book.qrCode?.status === SampleStatusEnum.APPROVED) {
      throw new BadRequestException('Cannot change a booking that has already been analyzed');
    }

    book.receivedServiceCalendarId = updateBookingDto.receivedServiceCalendarId;
    book.bookedAt = Date.now();

    return this.bookRepo.save(book);
  }

  async cancelBooking(bookId: number, farmerId: number): Promise<void> {
    const book = await this.bookRepo.findOne({
      where: { bookId },
      relations: ['qrCode'],
    });

    if (!book) {
      throw new NotFoundException('Booking not found');
    }

    if (book.farmerId !== farmerId) {
      throw new UnauthorizedException('You are not authorized to cancel this booking');
    }

    if (book.qrCode?.status === SampleStatusEnum.APPROVED) {
      throw new BadRequestException('Cannot cancel a booking that has already been analyzed');
    }

    await this.bookRepo.delete(bookId);
  }
}
