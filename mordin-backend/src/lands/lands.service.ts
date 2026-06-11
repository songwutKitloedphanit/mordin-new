/* eslint-disable prettier/prettier */
import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { formatGlobalDateWithOutWeekly } from 'src/common/utils/date.util';
import { Farmer } from 'src/farmers/entities/farmer.entity';
import { Book } from 'src/sample/books/entities/book.entity';
import { SampleStatusEnum } from 'src/sample/enums/qr-code.enum';
import { Repository } from 'typeorm';

import { CreateLandDto } from './dto/create-land.dto';
import { CreatePublicLandByFarmerDto } from './dto/create-public-land-by-farmer.dto';
import { LandSummaryDTO } from './dto/land-summary.dto';
import { UpdateLandByFarmerDto } from './dto/update-land-by-farmer.dto';
import { UpdateLandDto } from './dto/update-land.dto';
import { Land } from './entities/land.entity';
import { LandLog } from './entities/land.log.entity';

@Injectable()
export class LandsService {
  constructor(
    @InjectRepository(Land)
    private readonly landRepository: Repository<Land>,

    @InjectRepository(LandLog)
    private readonly landLog: Repository<LandLog>,

    @InjectRepository(Farmer)
    private readonly farmerRepository: Repository<Farmer>,

    @InjectRepository(Book)
    private readonly bookRepo: Repository<Book>,
  ) { }

  private normalizeAreaSize(areaSize: number | string | null | undefined): number {
    const parsedAreaSize = Number(areaSize);
    if (!Number.isFinite(parsedAreaSize) || parsedAreaSize <= 0) {
      throw new BadRequestException('areaSize must be a positive number');
    }

    return Math.round(parsedAreaSize);
  }

  async create(createLandDto: CreateLandDto, Uid?: number) {
    const uniqueCheck = await this.landRepository.findOne({
      where: {
        name: createLandDto.name,
        farmerId: createLandDto.farmerId,
      },
    });
    if (uniqueCheck) {
      throw new NotFoundException('Land with this name already exists for this farmer');
    }
    const land = this.landRepository.create({
      ...createLandDto,
      areaSize: this.normalizeAreaSize(createLandDto.areaSize),
      latitude: createLandDto.latitude === undefined || isNaN(Number(createLandDto.latitude)) ? undefined : parseFloat(createLandDto.latitude),
      longitude: createLandDto.longitude === undefined || isNaN(Number(createLandDto.longitude)) ? undefined : parseFloat(createLandDto.longitude),
      updateUid: Uid ?? null,
    });

    return this.landRepository.save(land);
  }

  async createPublicByFarmer(createLandDto: CreatePublicLandByFarmerDto) {
    const phone = (createLandDto.phone ?? '').replace(/\D/g, '');
    const firstName = createLandDto.firstName.trim();
    const farmer = await this.farmerRepository.findOne({
      where: {
        farmerId: createLandDto.farmerId,
        firstName,
        phone,
      },
    });

    if (!farmer) {
      throw new UnauthorizedException('Farmer information does not match');
    }

    return this.create({
      landCode: createLandDto.landCode?.trim() || undefined,
      name: createLandDto.name,
      areaSize: createLandDto.areaSize,
      latitude: createLandDto.latitude,
      longitude: createLandDto.longitude,
      subdistrictCode: createLandDto.subdistrictCode,
      zipCode: createLandDto.zipCode,
      farmerId: createLandDto.farmerId,
      quotaCode: undefined,
      village: undefined,
    });
  }

  findAll() {
    return this.landRepository
      .createQueryBuilder('land')
      .leftJoinAndSelect('land.farmer', 'farmer')
      .leftJoinAndSelect('land.subdistrict', 'subdistrict')
      .leftJoinAndSelect('subdistrict.district', 'district')
      .leftJoinAndSelect('district.province', 'province')
      .getMany();
  }

  findOne(id: number) {
    return this.landRepository
      .createQueryBuilder('land')
      .where('land.land_id = :id', { id })
      .leftJoinAndSelect('land.farmer', 'farmer')
      .leftJoinAndSelect('land.subdistrict', 'subdistrict')
      .leftJoinAndSelect('subdistrict.district', 'district')
      .leftJoinAndSelect('district.province', 'province')
      .getOne();
  }

  async update(id: number, updateLandDto: UpdateLandDto, Uid: number) {
    const land = await this.landRepository.findOneBy({ landId: id });
    if (!land) {
      throw new NotFoundException('Land not found');
    }

    const latitude =
      updateLandDto.latitude && !isNaN(Number(updateLandDto.latitude))
        ? parseFloat(updateLandDto.latitude)
        : undefined;

    const longitude =
      updateLandDto.longitude && !isNaN(Number(updateLandDto.longitude))
        ? parseFloat(updateLandDto.longitude)
        : undefined;

    Object.assign(land, updateLandDto, {
      areaSize: updateLandDto.areaSize === undefined
        ? land.areaSize
        : this.normalizeAreaSize(updateLandDto.areaSize),
      latitude,
      longitude,
      updateUid: Uid,
    });

    return this.landRepository.save(land);
  }


  async remove(id: number) {
    const userId = 99; // mockUid ...

    const land = await this.landRepository.findOneBy({ landId: id });

    if (!land) {
      throw new NotFoundException('Land not found');
    }

    (land as any).removedBy = userId;
    // await this.landRepository.save(land); // If soft delete logic needed later

    try {
      await this.landRepository.delete(id);
    } catch (error) {
      if (error.code === '23503') { // Foreign key violation
        throw new ConflictException(
          'แปลงนี้มีการผูกติดกับส่วนอื่นไปแล้ว ไม่สามารถลบได้'
        );
      }
      throw error;
    }
  }

  async getSummary() {
    const lands = await this.findAll();

    const landSummary: LandSummaryDTO = {
      totalLands: lands.length,
      needsImprovementCount: 0,
      normalSoilCount: 0,
      fertileSoilCount: 0,
    }

    const count = 0;
    await Promise.all(
      lands.map(async (land) => {
        const book = await this.bookRepo.findOne({
          where: { landId: land.landId },
          order: { bookedAt: 'DESC' },
          relations: [
            'ferMajorLandScore',
            'serviceType',
            'serviceType.soilGrades',
            'serviceType.soilGrades.soilGradeLevels'
          ]
        });

        const totalScoreLevels = book?.serviceType.soilGrades.find((soilGrade) => soilGrade.laboratoryId === null)?.soilGradeLevels;
        // Need to Fix Logic...
        totalScoreLevels?.forEach((level) => {
          const resultValue = book?.ferMajorLandScore.find((ferMajor) => ferMajor.resultId === null)?.resultValue;
          if (resultValue) {
            if (level.level === 1) {
              if (resultValue <= level.cutoffValue) {
                landSummary.needsImprovementCount++;
              }
            } else if (level.level !== 1 && level.level !== totalScoreLevels.length) {
              // right here still use mockup
              if (resultValue <= 10) {
                landSummary.normalSoilCount++;
              }
            }
            else {
              if (resultValue < 999) {
                landSummary.fertileSoilCount++;
              }
            }
          }
        })

      })
    )

    return landSummary;
  }

  getLogs() {
    return this.landLog.find();
  }

  async findByFarmerId(farmerId: number) {
    // 1. ดึงข้อมูล Land
    const lands = await this.landRepository
      .createQueryBuilder('land')
      .where('land.farmerId = :farmerId', { farmerId })
      .leftJoinAndSelect('land.farmer', 'farmer')
      .leftJoinAndSelect('land.subdistrict', 'subdistrict')
      .leftJoinAndSelect('subdistrict.district', 'district')
      .leftJoinAndSelect('district.province', 'province')
      .getMany();

    // 2. วนลูปแต่ละแปลงเพื่อหาสถานะ
    const result = await Promise.all(lands.map(async (land) => {
      // ดึง Book ล่าสุด พร้อม Calendar relations
      const books = await this.bookRepo.find({
        where: { landId: land.landId },
        relations: [
          'qrCode',
          'ferMajorLandScore',
          'analysisServiceCalendar', // [Added] เชื่อมกับ Calendar วันวิเคราะห์
          'receivedServiceCalendar'  // [Added] เชื่อมกับ Calendar วันรับตัวอย่าง (วันจอง)
        ],
        order: { bookedAt: 'DESC' }
      });

      const now = Date.now();
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
      // กำหนด Type ให้ชัดเจน
      const statusInfo: {
        bookId: number | null;
        status: string;
        daysRemaining: number | null;
        daysPassed: number | null;
        analysisDate: string | null;
        bookedDate: string | null;   // [Added] Field ใหม่
        resultValue: number | null;
      } = {
        bookId: null,
        status: 'ไม่ตรวจ',
        daysRemaining: null,
        daysPassed: null,
        analysisDate: null,
        bookedDate: null,            // [Init]
        resultValue: null,
      };

      // Logic 1: เช็คการจองที่กำลังจะมาถึง
      const upcomingBooking = books.find(b => {
        const isApproved = b.qrCode?.status === SampleStatusEnum.APPROVED;
        if (isApproved) {
          return false;
        }
        if (b.receivedServiceCalendar?.date) {
          const serviceDate = new Date(b.receivedServiceCalendar.date);
          const serviceDateStart = new Date(serviceDate.getFullYear(), serviceDate.getMonth(), serviceDate.getDate()).getTime();
          return serviceDateStart >= todayStart;
        }
        return false;
      });

      if (upcomingBooking) {
        statusInfo.bookId = upcomingBooking.bookId;
        statusInfo.status = 'จอง';
        const serviceDateTs = new Date(upcomingBooking.receivedServiceCalendar.date).getTime();
        const diffMs = serviceDateTs - now;
        statusInfo.daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        // [Added] ดึง bookedDate จาก receivedServiceCalendar
        if (upcomingBooking.receivedServiceCalendar?.date) {
          const bookedDate = new Date(upcomingBooking.receivedServiceCalendar.date);
          statusInfo.bookedDate = formatGlobalDateWithOutWeekly(bookedDate);
        }
      } else {
        // Logic 2: เช็คผลวิเคราะห์ล่าสุด (Approved)
        const latestResult = books.find(b => b.qrCode?.status === SampleStatusEnum.APPROVED);

        if (latestResult) {
          statusInfo.status = 'ตรวจ';

          // [Modified] ใช้ analysisDate จาก analysisServiceCalendar
          if (latestResult.analysisServiceCalendar?.date) {
            const analysisTs = new Date(latestResult.analysisServiceCalendar.date);
            statusInfo.analysisDate = formatGlobalDateWithOutWeekly(analysisTs);

            // คำนวณ daysPassed ใหม่ตามวันที่วิเคราะห์จริง
            const diffMs = now - analysisTs.getTime();
            statusInfo.daysPassed = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          }

          const scoreObj = latestResult.ferMajorLandScore?.find((f) => f.resultId === null);
          if (scoreObj) {
            statusInfo.resultValue = Number(scoreObj.resultValue);
          }
        }
      }

      return {
        ...land,
        landStatus: statusInfo
      };
    }));

    return result;
  }

  async removeByFarmer(landId: number, farmerId: number): Promise<void> {
    const land = await this.landRepository.findOne({
      where: { landId },
    });

    if (!land) {
      throw new NotFoundException('Land not found');
    }

    // [!!]
    // ตรวจสอบความเป็นเจ้าของ
    if (land.farmerId !== farmerId) {
      throw new UnauthorizedException('You are not authorized to delete this land');
    }

    //
    // (Optional)
    // ตรวจสอบว่ามีจองค้างอยู่หรือไม่
    // (ถ้ามี
    // book
    // ที่ยังไม่
    // approved
    // อาจจะลบไม่ได้)
    // ...

    //
    // ทำการลบ
    // (ตอนนี้เป็น
    // Hard
    // Delete)
    await this.landRepository.delete(landId);
  }

  async updateByFarmer(landId: number, updateDto: UpdateLandByFarmerDto) {
    const land = await this.landRepository.findOneBy({ landId });

    if (!land) {
      throw new NotFoundException('Land not found');
    }

    // [!!]
    // ตรวจสอบความเป็นเจ้าของ
    if (land.farmerId !== updateDto.farmerId) {
      throw new UnauthorizedException('You are not authorized to update this land');
    }

    //
    // เตรียมข้อมูล
    // (ไม่รวม
    // farmerId)
    const { farmerId, ...updateData } = updateDto;

    const latitude =
      updateData.latitude && !isNaN(Number(updateData.latitude))
        ? parseFloat(updateData.latitude)
        : land.latitude;

    const longitude =
      updateData.longitude && !isNaN(Number(updateData.longitude))
        ? parseFloat(updateData.longitude)
        : land.longitude;

    //
    // อัปเดตข้อมูล
    Object.assign(land, updateData, {
      areaSize: updateData.areaSize === undefined
        ? land.areaSize
        : this.normalizeAreaSize(updateData.areaSize),
      latitude,
      longitude,
      updateUid: null,
    });

    return this.landRepository.save(land);
  }
}
