import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import { CryptoService } from 'src/common/crypto/crypto.service';
import { Farmer } from 'src/farmers/entities/farmer.entity';
import { Land } from 'src/lands/entities/land.entity';
import { ServiceCalendar } from 'src/service-calendars/entities/service-calendar.entity';
import { Brackets, DataSource, In, Not, Repository } from 'typeorm';

import { BooksService } from '../books/books.service';
import { Book } from '../books/entities/book.entity';
import { SampleStatusEnum } from '../enums/qr-code.enum';
import { ResultsService } from '../results/results.service';

import { CreateQrCodeDto } from './dto/create-qr-code.dto';
import { QrCodeSummaryDto } from './dto/qr-code-summary.dto';
import { ReceiveSampleDto } from './dto/receive-sample.dto';
import { SearchQrCodeDto } from './dto/search-qr-code.dto';
import { UpdateQrCodeDto } from './dto/update-qr-code.dto';
import { QrCode } from './entities/qr-code.entity';
import { QrCodeLog } from './entities/qr-code.log.entity';

@Injectable()
export class QrCodesService {
  private readonly logger = new Logger(QrCodesService.name);
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,

    @InjectRepository(QrCode)
    private readonly qrCodeRepo: Repository<QrCode>,

    @InjectRepository(QrCodeLog)
    private readonly qrCodeLog: Repository<QrCodeLog>,

    @InjectRepository(Book)
    private readonly bookRepo: Repository<Book>,

    @InjectRepository(Land)
    private readonly landRepo: Repository<Land>,

    @InjectRepository(ServiceCalendar)
    private readonly serCalendarRepo: Repository<ServiceCalendar>,

    @InjectRepository(Farmer)
    private readonly farmerRepo: Repository<Farmer>,

    private readonly booksService: BooksService,

    private readonly cryptoService: CryptoService,

    private readonly resultService: ResultsService
  ) {}

  private async mapInputData(
    qrCode: QrCode,
    manager?: import('typeorm').EntityManager
  ): Promise<{ farmer: Farmer | null; land: Land | null }> {
    const thaiId = qrCode.thaiNationalId?.trim();
    const phone = qrCode.phoneNumber?.replace(/\D/g, ''); // normalize เบอร์
    const landCode = qrCode.landCode?.trim();

    const farmerRepo = manager?.getRepository(Farmer) ?? this.farmerRepo;
    const landRepo = manager?.getRepository(Land) ?? this.landRepo;
    const [farmerById, farmerByPhone] = await Promise.all([
      thaiId ? farmerRepo.findOne({ where: { thaiNationalId: thaiId } }) : null,
      phone ? farmerRepo.findOne({ where: { phone } }) : null,
    ]);

    let farmer: Farmer | null = null;

    const sameFarmer =
      farmerById &&
      farmerByPhone &&
      farmerById.farmerId === farmerByPhone.farmerId;
    if (sameFarmer) {
      farmer = farmerById;
    } else if (farmerById && farmerByPhone === null) {
      farmer = farmerById;
    } else if (farmerById === null && farmerByPhone) {
      farmer = farmerByPhone;
    } else {
      // conflict or not found — ปล่อย farmer = null โดยตั้งใจ (กันผูกตัวอย่างผิดคน)
      // แต่ต้อง log ให้เจ้าหน้าที่ตามต่อได้ ไม่ปล่อยเงียบ
      farmer = null;
      if (farmerById && farmerByPhone) {
        // เลขบัตรตรงคนหนึ่ง แต่เบอร์โทรตรงอีกคนหนึ่ง — ข้อมูลขัดกัน
        this.logger.warn(
          `Farmer conflict on QR ${qrCode.qrCode}: thaiNationalId matches farmerId=${farmerById.farmerId} ` +
            `but phone matches farmerId=${farmerByPhone.farmerId}. Sample saved WITHOUT farmer link; staff must reconcile.`
        );
      } else if (thaiId || phone) {
        // มีข้อมูลระบุตัวตนแต่ไม่พบเกษตรกรในระบบ — เป็นเกษตรกรรายใหม่/ยังไม่ลงทะเบียน
        this.logger.warn(
          `No matching farmer for QR ${qrCode.qrCode} (thaiNationalId/phone provided but not found). ` +
            `Sample saved WITHOUT farmer link; staff must register/link this farmer.`
        );
      }
    }

    let land: Land | null = null;
    if (landCode) {
      const foundLand = await landRepo.findOne({ where: { landCode } });
      if (foundLand) {
        const isOwnedByFarmer =
          farmer && foundLand.farmerId === farmer.farmerId;
        land = isOwnedByFarmer || !farmer ? foundLand : null;
        if (farmer && foundLand.farmerId !== farmer.farmerId) {
          // landCode มีอยู่จริงแต่เป็นของเกษตรกรคนอื่น — ไม่ผูกแปลง ใช้ข้อมูลที่กรอกแทน
          this.logger.warn(
            `Land code "${landCode}" on QR ${qrCode.qrCode} belongs to farmerId=${foundLand.farmerId}, ` +
              `not the matched farmerId=${farmer.farmerId}. Land link skipped.`
          );
        }
      }
    }

    return { farmer, land };
  }

  private normalizeCoordinate(
    value: unknown,
    min: number,
    max: number,
    fieldName: 'latitude' | 'longitude'
  ): string {
    const rawValue = String(value ?? '').trim();
    if (!rawValue) {
      throw new BadRequestException(`${fieldName} is required`);
    }

    if (!/^-?\d+(\.\d{1,6})?$/.test(rawValue)) {
      throw new BadRequestException(
        `${fieldName} must be a decimal with up to 6 digits`
      );
    }

    const numericValue = Number(rawValue);
    if (
      !Number.isFinite(numericValue) ||
      numericValue < min ||
      numericValue > max
    ) {
      throw new BadRequestException(`${fieldName} is invalid`);
    }

    return numericValue.toFixed(6);
  }

  private normalizeOptionalAreaSize(value: unknown): number | null {
    if (value === undefined || value === null || String(value).trim() === '') {
      return null;
    }

    const numericValue = Number(value);
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      throw new BadRequestException('areaSize must be a positive number');
    }

    return numericValue;
  }

  private normalizeOptionalZipCode(value: unknown): number | null {
    if (value === undefined || value === null || String(value).trim() === '') {
      return null;
    }

    const numericValue = Number(value);
    if (!Number.isInteger(numericValue) || String(numericValue).length !== 5) {
      throw new BadRequestException('zipCode must be a 5 digit number');
    }

    return numericValue;
  }

  async getLatestSequenceInYear(year: number): Promise<number> {
    const yearShort = (year % 100).toString().padStart(2, '0');

    // Only count QR codes generated by this service. Mock/test QR codes can share
    // the same created_at year but do not follow the YY-000000-CS format.
    const latestQr = await this.qrCodeRepo
      .createQueryBuilder('qrCode')
      .where('qrCode.qrCode ~ :pattern', {
        pattern: `^${yearShort}-[0-9]{6}-[0-9]{2}$`,
      })
      .orderBy('CAST(SUBSTRING(qrCode.qrCode FROM 4 FOR 6) AS INTEGER)', 'DESC')
      .getOne();

    if (!latestQr) {
      return 0;
    }

    const seq = parseInt(latestQr.qrCode.split('-')[1], 10);
    return isNaN(seq) ? 0 : seq;
  }

  /**
   * [OPTIMIZED] สร้าง QR Code แบบ Bulk และปรับแก้ข้อมูลที่ส่งกลับ
   */
  async generateQrCode(
    count: number,
    createQrCodeDto: CreateQrCodeDto,
    Uid: number
  ): Promise<{ qrCode: string; encryptedCode: string }[]> {
    // <--- ปรับแก้ Return Type

    return this.dataSource.transaction(async manager => {
      const qrCodeRepo = manager.getRepository(QrCode);
      const bookRepo = manager.getRepository(Book);
      const now = new Date();
      const year = now.getFullYear();
      const yearShort = year % 100;

      // STEP 1: Query จำนวนเริ่มต้นเพียงครั้งเดียว
      const startIndex = await this.getLatestSequenceInYear(year); // ใช้ repo ปกติได้ เพราะเป็นแค่การอ่านค่าเริ่มต้น
      const createdAt = Date.now();

      const qrCodeDataList: { qrCode: string; encryptedCode: string }[] = [];
      const qrCodeEntitiesToSave: Partial<QrCode>[] = [];

      // STEP 2: เตรียมข้อมูลทั้งหมดใน Memory ก่อน (ไม่มี await ใน loop)
      for (let i = 0; i < count; i++) {
        const sequence = startIndex + i + 1;
        const sequenceStr = sequence.toString().padStart(6, '0');
        const base = `${yearShort}-${sequenceStr}`;
        const digits = `${yearShort.toString().padStart(2, '0')}${sequenceStr}`
          .split('')
          .map(Number);
        const x = digits.reduce((sum, digit) => sum + digit, 0) % 10;
        const nonZeroDigits = digits.filter(d => d !== 0);
        const y =
          nonZeroDigits.length > 0
            ? nonZeroDigits.reduce((prod, digit) => prod * digit, 1) % 10
            : 0;

        const qrCodeStr = `${base}-${x}${y}`;
        const encryptedQrCode = this.cryptoService.encrypt(qrCodeStr);

        // เตรียมข้อมูลสำหรับส่งกลับ
        qrCodeDataList.push({
          qrCode: qrCodeStr,
          encryptedCode: encryptedQrCode,
        });

        // เตรียม Entity สำหรับ save
        qrCodeEntitiesToSave.push({
          qrCode: qrCodeStr,
          createdUid: Uid,
          type: createQrCodeDto.type,
          serviceAreaId: createQrCodeDto.serviceAreaId ?? null,
          serviceCalendarId: createQrCodeDto.serviceCalendarId ?? null,
          createdAt,
        });
      }

      // STEP 3: Bulk Save QrCodes ทั้งหมดในครั้งเดียว
      const savedQrCodes = await qrCodeRepo.save(qrCodeEntitiesToSave, {
        chunk: 200,
      });

      // STEP 4: Bulk Create และ Save Books ทั้งหมดในครั้งเดียว
      // const booksToCreate = savedQrCodes.map(qr =>
      //   bookRepo.create({ qrCodeId: qr.qrCodeId })
      // );
      // await bookRepo.save(booksToCreate, { chunk: 200 });

      // STEP 5: ส่งข้อมูลที่เตรียมไว้กลับไป
      return qrCodeDataList;
    });
  }

  create(createQrCodeDto: CreateQrCodeDto, Uid: number) {
    return 'This action adds a new qrCode';
  }

  async encryptQrCode(qrCode: string) {
    return this.cryptoService.encrypt(qrCode);
  }

  async searchAndPagination(searchDto: SearchQrCodeDto) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'DESC',
      search,
      all = false,
      status,
      type,
      serviceAreaId,
      year,
      serviceCalendarId,
      receivedServiceCalendarId,
      factoryId,
    } = searchDto;

    const queryBuilder = this.qrCodeRepo.createQueryBuilder('qrCode');

    // --- JOINS ---
    queryBuilder
      .leftJoinAndSelect('qrCode.book', 'book')
      .leftJoinAndSelect('book.farmer', 'farmer')
      .leftJoinAndSelect('qrCode.serviceArea', 'serviceArea')
      .leftJoinAndSelect('serviceArea.factory', 'factory')
      .leftJoinAndSelect('qrCode.createdUser', 'user');

    // --- FILTERS (WHERE clauses) ---
    // 1. Filter ด้วย Keyword (search)
    if (search) {
      queryBuilder.andWhere(
        new Brackets(qb => {
          qb.where('qrCode.qrCode ILIKE :search', { search: `%${search}%` })
            .orWhere('qrCode.firstName ILIKE :search')
            .orWhere('qrCode.lastName ILIKE :search')
            .orWhere('qrCode.phoneNumber ILIKE :search')
            .orWhere('book.sampleCode ILIKE :search');
        })
      );
    }

    // 2. Filter ด้วย status
    if (status && status.length > 0) {
      queryBuilder.andWhere('qrCode.status IN (:...status)', { status });
    }

    // 3. Filter ด้วย type
    if (type) {
      queryBuilder.andWhere('qrCode.type = :type', { type });
    }

    // 4. Filter ด้วย serviceAreaId
    if (serviceAreaId) {
      queryBuilder.andWhere('qrCode.serviceAreaId = :serviceAreaId', {
        serviceAreaId,
      });
    }

    // Filter ด้วย factoryId
    if (factoryId) {
      queryBuilder.andWhere('factory.factoryId = :factoryId', { factoryId });
    }

    // 5. Filter ด้วย year
    if (year) {
      // สร้างช่วงเวลาของปีนั้นๆ
      const startDate = new Date(year, 0, 1).getTime(); // 1 มกราคม ของปีนั้น
      const endDate = new Date(year + 1, 0, 1).getTime() - 1; // 31 ธันวาคม ของปีนั้น

      // ใช้ Between Operator ของ TypeORM กับ createdAt
      queryBuilder.andWhere(
        'qrCode.createdAt BETWEEN :startDate AND :endDate',
        {
          startDate,
          endDate,
        }
      );
    }

    // 6. Filter ด้วย serviceCalendarId
    if (serviceCalendarId) {
      queryBuilder.andWhere('qrCode.serviceCalendarId = :serviceCalendarId', {
        serviceCalendarId,
      });
    }

    // 7. FIlter ด้วย receivedServiceCalendarId
    if (receivedServiceCalendarId) {
      queryBuilder.andWhere(
        'book.receivedServiceCalendarId = :receivedServiceCalendarId',
        { receivedServiceCalendarId }
      );
    }

    // --- COUNTING ---
    const total = await queryBuilder.getCount();

    // --- SORTING ---
    const orderFieldMap = {
      createdAt: 'qrCode.createdAt',
      status: 'qrCode.status',
      type: 'qrCode.type',
      sampleCode: 'book.sampleCode',
      fullName: 'qrCode.firstName', // สามารถเรียงตามชื่อได้
      collectSampleAt: 'book.collectSampleAt',
      sampleReceivedAt: 'book.sampleReceivedAt',
    };
    const orderField = orderFieldMap[sortBy] || 'qrCode.createdAt';
    // สำหรับการเรียงตามชื่อ-นามสกุล
    if (sortBy === 'fullName') {
      queryBuilder
        .orderBy('qrCode.firstName', order)
        .addOrderBy('qrCode.lastName', order);
    } else {
      queryBuilder.orderBy(orderField, order);
    }

    // --- PAGINATION ---
    if (!all) {
      queryBuilder.skip((page - 1) * limit).take(limit);
    }

    const data = await queryBuilder.getMany();

    return {
      data,
      total,
      page: all ? 1 : page,
      limit: all ? total : limit,
      totalPages: all ? 1 : Math.ceil(total / limit),
    };
  }

  findCollectedQrCodes() {
    return this.qrCodeRepo.find({
      where: {
        status: SampleStatusEnum.COLLECTED,
      },
      relations: {
        book: true,
      },
    });
  }

  async findOne(qrCode: string) {
    const sample = await this.qrCodeRepo.findOne({
      where: { qrCode },
      relations: {
        book: {
          land: {
            subdistrict: {
              district: {
                province: true,
              },
            },
          },
          farmer: {
            factory: true,
            serviceArea: true,
          },
          serviceType: true,
          subdistrict: {
            district: {
              province: true,
            },
          },
          receivedServiceCalendar: {
            bus: true,
          },
        },
      },
    });
    if (!sample) throw new NotFoundException('QrCode not found');

    let result: any[] = [];
    if (sample.book) {
      result = await this.resultService.findAllByBookId(sample.book.bookId);
    }
    return {
      ...sample,
      result,
    };
  }

  async findOneByEncryptCode(code: string) {
    try {
      const decrypted = this.cryptoService.decrypt(code);
      const qrCode = await this.qrCodeRepo.findOne({
        where: { qrCode: decrypted },
      });
      if (!qrCode) {
        throw new NotFoundException('QrCode not found');
      }
      if (qrCode.status !== SampleStatusEnum.DISTRIBUTED) {
        return {
          status: qrCode.status,
          message: 'Soil sample information has already been recorded',
        };
      }
      return {
        status: qrCode.status,
        type: qrCode.type,
        serviceAreaId: qrCode.serviceAreaId,
        serviceCalendarId: qrCode.serviceCalendarId,
      };
    } catch (error) {
      throw new NotFoundException('QrCode not found');
    }
  }

  async checkEncryptQrCode(code: string): Promise<boolean> {
    try {
      const decrypted = this.cryptoService.decrypt(code);
      return !!(await this.qrCodeRepo.findOne({
        where: { qrCode: decrypted },
      }));
    } catch {
      return false;
    }
  }

  async update(id: number, updateQrCodeDto: UpdateQrCodeDto, Uid: number) {
    const qrCode = await this.qrCodeRepo.findOne({ where: { qrCodeId: id } });
    if (!qrCode) throw new NotFoundException(`QrCode ${id} not found`);
    const {
      firstName,
      lastName,
      phoneNumber,
      thaiNationalId,
      landCode,
      landName,
      serviceAreaId,
      dirtWeightOm,
      dirtWeightMehlich,
    } = updateQrCodeDto;
    return this.qrCodeRepo.save({
      ...qrCode,
      ...(firstName !== undefined && { firstName }),
      ...(lastName !== undefined && { lastName }),
      ...(phoneNumber !== undefined && { phoneNumber }),
      ...(thaiNationalId !== undefined && { thaiNationalId }),
      ...(landCode !== undefined && { landCode }),
      ...(landName !== undefined && { landName }),
      ...(serviceAreaId !== undefined && { serviceAreaId }),
      ...(dirtWeightOm !== undefined && { dirtWeightOm }),
      ...(dirtWeightMehlich !== undefined && { dirtWeightMehlich }),
    });
  }

  async remove(id: number) {
    const qrCode = await this.qrCodeRepo.findOne({
      where: { qrCodeId: id },
      relations: { book: true },
    });

    if (!qrCode) {
      throw new NotFoundException('QrCode not found');
    }
    if (qrCode.status !== SampleStatusEnum.DISTRIBUTED) {
      throw new BadRequestException(
        'ไม่สามารถลบได้ เนื่องจาก QR Code นี้ถูกใช้งานแล้ว'
      );
    }

    if (qrCode.book) {
      throw new BadRequestException(
        'ไม่สามารถลบได้ เนื่องจาก QR Code นี้มีการกรอกข้อมูลเข้ามาแล้ว'
      );
    }

    return this.qrCodeRepo.remove(qrCode);
  }

  //ใช้สำหรับ Update ข้อมูลจากที่เกษตรกรเก็บตัวอย่างแล้ว Scan QrCode กรอกข้อมูล
  async updateDataByFarmer(code: string, updateData: UpdateQrCodeDto) {
    const decryptCode = this.cryptoService.decrypt(code);
    return this.dataSource.transaction(async manager => {
      const qrCode = await manager.findOne(QrCode, {
        where: { qrCode: decryptCode },
        lock: { mode: 'pessimistic_write' },
      });
      if (!qrCode) {
        throw new NotFoundException('QrCode not found');
      }
      if (qrCode.status !== SampleStatusEnum.DISTRIBUTED) {
        throw new BadRequestException(
          'Soil sample information has already been recorded'
        );
      }
      // const book = await this.bookRepo.findOne({
      //   where: { qrCodeId: qrCode.qrCodeId },
      // });
      // if (!book) {
      //   throw new NotFoundException('Book not found');
      // }

      // --- [เริ่มส่วนที่แก้ไข] ---

      // 1. ลองค้นหา Book ของ QR Code นี้ก่อน
      let book = await manager.findOne(Book, {
        where: { qrCodeId: qrCode.qrCodeId },
      });

      // 2. ถ้าไม่เจอ (แสดงว่าเป็น QR ลอยๆ ที่เพิ่งถูกสแกนครั้งแรก) ให้สร้าง Instance ใหม่
      if (!book) {
        book = manager.create(Book, {
          qrCodeId: qrCode.qrCodeId,
        });
      }

      // --- [จบส่วนที่แก้ไข] ---

      const {
        firstName,
        lastName,
        phoneNumber,
        thaiNationalId,
        landCode,
        landName,
      } = updateData;
      const { serviceAreaId, latitude, longitude, serviceTypeId } = updateData;
      const areaSize = this.normalizeOptionalAreaSize(updateData.areaSize);
      const subdistrictCode = updateData.subdistrictCode?.trim() || null;
      const zipCode = this.normalizeOptionalZipCode(updateData.zipCode);
      const normalizedLatitude = this.normalizeCoordinate(
        latitude,
        -90,
        90,
        'latitude'
      );
      const normalizedLongitude = this.normalizeCoordinate(
        longitude,
        -180,
        180,
        'longitude'
      );

      const updateQrCode = {
        ...qrCode,
        firstName,
        status: SampleStatusEnum.COLLECTED,
        lastName,
        phoneNumber,
        thaiNationalId,
        landCode,
        landName,
        ...(updateData.dirtWeightOm !== undefined && {
          dirtWeightOm: updateData.dirtWeightOm,
        }),
        ...(updateData.dirtWeightMehlich !== undefined && {
          dirtWeightMehlich: updateData.dirtWeightMehlich,
        }),
      };

      const updatedQrCode = await manager.save(QrCode, updateQrCode);
      let { farmer, land } = await this.mapInputData(updatedQrCode, manager);

      if (updateData.farmerId) {
        const phone = phoneNumber?.replace(/\D/g, '');
        const verifiedFarmer = await manager.findOne(Farmer, {
          where: {
            farmerId: updateData.farmerId,
            firstName,
            phone,
          },
        });

        if (!verifiedFarmer) {
          throw new BadRequestException('Farmer information does not match');
        }

        farmer = verifiedFarmer;
      }

      if (updateData.landId) {
        if (!farmer) {
          throw new BadRequestException(
            'Cannot link land without matched farmer'
          );
        }

        const verifiedLand = await manager.findOne(Land, {
          where: {
            landId: updateData.landId,
            farmerId: farmer.farmerId,
          },
        });

        if (!verifiedLand) {
          throw new BadRequestException(
            'Land does not belong to matched farmer'
          );
        }

        land = verifiedLand;
      }

      if (farmer && updateData.birthDate) {
        farmer.birthDate = updateData.birthDate;
        await manager.save(Farmer, farmer);
      }

      const updateBook = {
        ...book,
        collectSampleAt: Date.now(),
        serviceAreaId,
        latitude: normalizedLatitude,
        longitude: normalizedLongitude,
        serviceTypeId,
        landId: land ? land.landId : undefined,
        areaSize: land ? land.areaSize : (areaSize ?? book.areaSize),
        subdistrictCode: land
          ? land.subdistrictCode
          : (subdistrictCode ?? book.subdistrictCode),
        zipCode: land ? land.zipCode : (zipCode ?? book.zipCode),
        farmerId: farmer ? farmer.farmerId : undefined,
      };
      await manager.save(Book, updateBook);
      return {
        status: SampleStatusEnum.COLLECTED,
        message: 'Soil sample information has been recorded',
      };
    });
  }

  async receiveQrCodeSampleByEncryptedCode(
    encryptedQrCode: string,
    receiveSampleDto: ReceiveSampleDto,
    Uid: number
  ) {
    const decryptCode = this.cryptoService.decrypt(encryptedQrCode);
    return await this.receiveQrCodeSample(decryptCode, receiveSampleDto);
  }

  async receiveQrCodeSampleByDecryptedCode(
    decryptedCode: string,
    receiveSampleDto: ReceiveSampleDto,
    Uid: number
  ) {
    return await this.receiveQrCodeSample(decryptedCode, receiveSampleDto);
  }

  //ใช้ตอนเจ้าหน้าที่ Scan รับตัวอย่างจากเกษตรกร
  async receiveQrCodeSample(
    decryptedCode: string,
    receiveSampleDto: ReceiveSampleDto
  ) {
    const mockUid = 1;
    const { serviceCalendarId, bookId } = receiveSampleDto;

    const qrCode = await this.qrCodeRepo.findOne({
      where: { qrCode: decryptedCode },
    });
    if (!qrCode) throw new NotFoundException('QrCode not found');

    // ตรวจสอบสถานะว่ารับตัวอย่างไปแล้วหรือยัง
    if (
      ![SampleStatusEnum.DISTRIBUTED, SampleStatusEnum.COLLECTED].includes(
        qrCode.status
      )
    ) {
      const book = await this.bookRepo.findOne({
        where: { qrCodeId: qrCode.qrCodeId },
      });

      return {
        alreadyReceived: true,
        message: 'Sample already received',
        qrCode,
        book,
      };
    }

    // --- [เริ่มส่วนที่แก้ไข: Pairing Logic] ---

    let book: Book | null;

    // 1. ถ้ามี bookId (กรณี Pairing กับ Booking)
    if (bookId) {
      // ค้นหา Booking ที่ต้องการ Pair
      const existingBook = await this.bookRepo.findOne({
        where: { bookId },
        relations: ['farmer', 'land', 'serviceType'],
      });

      if (!existingBook) {
        throw new NotFoundException(`Booking with ID ${bookId} not found`);
      }

      // ตรวจสอบว่า Booking นี้ยังไม่ถูก Pair กับ QR อื่นแล้ว
      if (existingBook.qrCodeId && existingBook.qrCodeId !== qrCode.qrCodeId) {
        throw new BadRequestException(
          'This booking is already paired with another QR code'
        );
      }

      // Pair QR Code กับ Booking
      book = existingBook;
      book.qrCodeId = qrCode.qrCodeId;
    }
    // 2. กรณี Walk-in (ไม่มี bookId)
    else {
      // ค้นหา Book เดิม
      book = await this.bookRepo.findOne({
        where: { qrCodeId: qrCode.qrCodeId },
      });

      // ถ้าไม่เจอ (กรณี Walk-in ยังไม่ได้กรอกข้อมูล) ให้สร้าง Instance ใหม่รอไว้
      if (!book) {
        book = this.bookRepo.create({ qrCodeId: qrCode.qrCodeId });
      }
    }

    // --- [จบส่วนที่แก้ไข] ---

    // =====================ทำ Update Book ด้วยข้อมูลที่มี============================

    // หา ServiceCalendar ที่เป็นของวันที่เจ้าหน้าที่รับตัวอย่าง จาก ID เพื่อเอา LabSetting ของวันนั้นๆ
    const serviceCalendar = await this.serCalendarRepo.findOne({
      where: { serviceCalendarId },
      relations: {
        bus: true,
      },
    });
    if (!serviceCalendar)
      throw new NotFoundException('ServiceCalendar not found');

    // หา Book ที่รับมาใน serviceCalendar นี้แล้วเพื่อสร้าง SampleCode
    const bookInServiceCalendar = await this.bookRepo.find({
      where: {
        receivedServiceCalendarId: serviceCalendar.serviceCalendarId,
        qrCodeId: Not(qrCode.qrCodeId),
        qrCode: {
          status: Not(
            SampleStatusEnum.COLLECTED || SampleStatusEnum.DISTRIBUTED
          ),
        },
      },
    });

    const sampleCode =
      serviceCalendar.bus.busNumber +
      '-' +
      dayjs(serviceCalendar.date).format('YYMMDD') +
      '-' +
      (bookInServiceCalendar.length + 1).toString().padStart(2, '0');

    // อัปเดต Book ด้วยข้อมูลที่มี
    const updateBook = {
      ...book,
      sampleReceivedAt: Date.now(),
      sampleReceivedUid: mockUid,
      receivedServiceCalendarId: serviceCalendar.serviceCalendarId,
      sampleCode,
    };

    const updatedBook = await this.bookRepo.save(updateBook);

    // อัปเดตสถานะ QR Code
    const updateQrCode = {
      ...qrCode,
      status: SampleStatusEnum.RECEIVED,
    };
    const finalQrCode = await this.qrCodeRepo.save(updateQrCode);

    return {
      alreadyReceived: false,
      qrCode: finalQrCode,
      book: updatedBook,
    };
  }

  async approveQrCodeSampleByBookId(bookIds: number[]) {
    const qrCodes = await this.qrCodeRepo.find({
      where: {
        book: {
          bookId: In(bookIds),
        },
      },
      relations: ['book'],
    });

    const updatedQrCodes = qrCodes.map(qrCode => ({
      ...qrCode,
      status: SampleStatusEnum.APPROVED,
    }));

    return await this.qrCodeRepo.save(updatedQrCodes);
  }

  getDecryptCode(code: string) {
    return this.cryptoService.decrypt(code);
  }

  async getQrCodeSummary(): Promise<QrCodeSummaryDto> {
    const [total, distributed, reserved, completed] = await Promise.all([
      this.qrCodeRepo.count(),
      this.qrCodeRepo.count({
        where: { status: SampleStatusEnum.DISTRIBUTED },
      }),
      this.qrCodeRepo.count({
        where: [
          { status: SampleStatusEnum.COLLECTED },
          { status: SampleStatusEnum.RECEIVED },
          { status: SampleStatusEnum.ANALYZING },
        ],
      }),
      this.qrCodeRepo.count({
        where: [
          { status: SampleStatusEnum.ANALYZED },
          { status: SampleStatusEnum.APPROVED },
        ],
      }),
    ]);

    return { total, distributed, reserved, completed };
  }

  getLogs() {
    return this.qrCodeLog.find();
  }
}
