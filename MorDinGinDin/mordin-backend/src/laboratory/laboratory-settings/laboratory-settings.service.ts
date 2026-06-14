import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateLaboratorySettingDto } from './dto/create-laboratory-setting.dto';
import { UpdateLaboratorySettingDto } from './dto/update-laboratory-setting.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LaboratorySetting } from './entities/laboratory-setting.entity';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { Laboratory } from '../laboratories/entities/laboratory.entity';
import { MachineTypeTypes } from '../enums/machine-type.enum';
import { ServiceCalendar } from 'src/service-calendars/entities/service-calendar.entity';
import { UpdateLaboratorySettingDetailDto } from '../laboratory-setting-details/dto/update-laboratory-setting-detail.dto';
import { LaboratorySettingDetail } from '../laboratory-setting-details/entities/laboratory-setting-detail.entity';
import { CalculationService } from 'src/common/calculation/calculation.service';
import { ConvertOmSetting } from '../convert-om-settings/entities/convert-om-setting.entity';
import { LaboratorySettingLog } from './entities/laboratory-setting.log.entity';

@Injectable()
export class LaboratorySettingsService {
  constructor(
    @InjectRepository(LaboratorySetting)
    private labSettingRepo: Repository<LaboratorySetting>,

    @InjectRepository(Laboratory)
    private labRepo: Repository<Laboratory>,

    @InjectRepository(LaboratorySettingDetail)
    private labSettingDetailRepo: Repository<LaboratorySettingDetail>,

    @InjectRepository(ServiceCalendar)
    private serviceCalendarRepo: Repository<ServiceCalendar>,

    private readonly calculationService: CalculationService,

    @InjectRepository(ConvertOmSetting)
    private convertOmSettingRepository: Repository<ConvertOmSetting>,

    @InjectRepository(LaboratorySettingLog)
    private laboratorySettingLog: Repository<LaboratorySettingLog>

  ) { }

  create(createLaboratorySettingDto: CreateLaboratorySettingDto, Uid: number) {
    return 'This action adds a new laboratorySetting';
  }

  findAll() {
    return this.labSettingRepo.find({
      relations: {
        laboratory: {
          machineType: true,
        },
        serviceCalendar: true,
        laboratorySettingDetails: true,
        convertOmSettings: true,
      },
    });
  }

  findOne(id: number) {
    return this.labSettingRepo.findOne({
      where: { laboratorySettingId: id },
      relations: {
        laboratory: {
          machineType: true,
        },
        serviceCalendar: true,
        laboratorySettingDetails: true,
        convertOmSettings: true,
      },
    });
  }

  async update(updateDatas: UpdateLaboratorySettingDto[], Uid: number) {
    let labSettings: LaboratorySetting[] = [];
    for (const updateData of updateDatas) {
      const { laboratorySettingId } = updateData;
      const labSetting = await this.labSettingRepo.findOne({
        where: { laboratorySettingId: laboratorySettingId },
      });
      if (!labSetting) {
        throw new NotFoundException('Laboratory setting not found');
      }
      const updatedLabSettingData = {
        ...labSetting,
        ...updateData,
        updateUid: Uid,
      };
      const updatedLabSetting = await this.labSettingRepo.save(
        updatedLabSettingData,
      );
      labSettings.push(updatedLabSetting);
    }
    return labSettings;
  }

  remove(id: number) {
    return `This action removes a #${id} laboratorySetting`;
  }

  /**
     * [OPTIMIZED] ปรับปรุงให้สร้าง Lab Settings ทั้งหมดแบบ Bulk และเพิ่ม Logic การตั้งค่าเริ่มต้น
     */
  async createAllFromServiceCalendarId(
    serviceCalendarId: number,
    updateUid: number,
  ) {
    // STEP 1: ดึงข้อมูล Lab ทั้งหมดที่จำเป็นในครั้งเดียว
    const labs = await this.labRepo.find({
      relations: {
        machineType: true,
      },
    });

    // STEP 2: เตรียมข้อมูล Lab Settings ทั้งหมดใน Memory
    const labSettingsToCreate: Partial<LaboratorySetting>[] = [];

    for (const lab of labs) {
      const setting: Partial<LaboratorySetting> = {
        serviceCalendarId: serviceCalendarId,
        laboratoryId: lab.laboratoryId,
        updateUid: updateUid,
      };

      // เพิ่ม Logic การกำหนดค่าเริ่มต้นตาม MachineType
      if (lab.machineType?.type === MachineTypeTypes.REVERSE_LINEAR) {
        setting.extractAmount = 0.02;
        setting.extractConcentration = 0.02;
      } else {
        setting.extractAmount = 0.03;
      }

      labSettingsToCreate.push(this.labSettingRepo.create(setting));
    }

    // STEP 3: Bulk Save Lab Settings ทั้งหมดในครั้งเดียว
    const savedLabSettings = await this.labSettingRepo.save(labSettingsToCreate);

    // STEP 4: เตรียมและ Bulk Save ConvertOmSettings (ถ้ามี)
    const convertOmSettingsToCreate: Partial<ConvertOmSetting>[] = [];
    for (const savedSetting of savedLabSettings) {
      // หา Lab เดิมจากที่ดึงมาตอนแรกเพื่อเช็ค machineType
      const originalLab = labs.find(l => l.laboratoryId === savedSetting.laboratoryId);
      if (originalLab?.machineType?.type === MachineTypeTypes.REVERSE_LINEAR) {
        convertOmSettingsToCreate.push(this.convertOmSettingRepository.create({
          laboratorySettingId: savedSetting.laboratorySettingId,
          updateUid: updateUid,
        }));
      }
    }

    if (convertOmSettingsToCreate.length > 0) {
      await this.convertOmSettingRepository.save(convertOmSettingsToCreate);
    }
  }

  // สร้าง lab-setting สำหรับ laboratoryId ใหม่สำหรับทุก service-calendar ที่กำลังจะมาถึง
  async createByNewLabIdForUpcomingCalendar(
    laboratoryId: number,
    updateUid: number,
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcomingCalendars = await this.serviceCalendarRepo.find({
      where: {
        date: MoreThanOrEqual(today),
      },
    });

    for (const calendar of upcomingCalendars) {
      const labSetting = this.labSettingRepo.create({
        serviceCalendarId: calendar.serviceCalendarId,
        laboratoryId: laboratoryId,
        updateUid: updateUid,
      });
      await this.labSettingRepo.save(labSetting);
    }
  }

  async updateWorkingStandard(
    labSettingId: number,
    updateLabSettingDetailDto: UpdateLaboratorySettingDetailDto[],
    Uid: number
  ) {
    const labSetting = await this.labSettingRepo.findOne({
      where: { laboratorySettingId: labSettingId },
      relations: {
        laboratorySettingDetails: true,
        laboratory: {
          machineType: true,
        },
      },
    });
    if (!labSetting) {
      throw new Error('Laboratory setting not found');
    }
    // If update DTO is not empty and has at least 3 items
    if (updateLabSettingDetailDto.length >= 3) {
      // Remove existing laboratory setting details
      if (labSetting.laboratorySettingDetails.length > 0) {
        await this.labSettingDetailRepo.remove(
          labSetting.laboratorySettingDetails,
        );
        labSetting.laboratorySettingDetails = [];
      }

      // Create and assign new laboratory setting details
      for (const detailDto of updateLabSettingDetailDto) {
        const newDetail = this.labSettingDetailRepo.create({
          ...detailDto,
          laboratorySettingId: labSettingId,
        });
        labSetting.laboratorySettingDetails.push(newDetail);
      }
      const { rSquare, slope, intercept } = this.calculationService.calculateLinearRegression(labSetting);
      const updatedLabSetting = {
        ...labSetting,
        rSquared: rSquare,
        slope: slope,
        intercept: intercept,
      };

      // Save the updated laboratory setting with new details
      if (updatedLabSetting) {
        return this.labSettingRepo.save(updatedLabSetting);
      } else {
        throw new HttpException('Failed to calculate linear regression', 500);
      }
    } else {
      throw new HttpException(
        'Laboratory setting details must have at least 3 items',
        400,
      );
    }
  }

  getLogs() {
    return this.laboratorySettingLog.find();
  }
}
