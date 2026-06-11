import { InjectDataSource } from '@nestjs/typeorm';
import { Bus } from 'src/buses/entities/bus.entity';
import { BusLog } from 'src/buses/entities/bus.log.entity';
import { LaboratorySettingDetail } from 'src/laboratory/laboratory-setting-details/entities/laboratory-setting-detail.entity';
import { LaboratorySettingDetailLog } from 'src/laboratory/laboratory-setting-details/entities/laboratory-setting-detail.log.entity';
import { ConvertOmSettingLog } from 'src/laboratory/convert-om-settings/entities/convert-om-setting.log.entity';
import { ConvertOmSetting } from 'src/laboratory/convert-om-settings/entities/convert-om-setting.entity';
import { SoilGrade } from 'src/soil-grade/soil-grades/entities/soil-grade.entity';
import { SoilGradeLog } from 'src/soil-grade/soil-grades/entities/soil-grade.log.entity';
import { SoilGradeLevelLog } from 'src/soil-grade/soil-grade-levels/entities/soil-grade-level.log.entity';
import { SoilGradeLevel } from 'src/soil-grade/soil-grade-levels/entities/soil-grade-level.entity';
import { Standard } from 'src/standard-sample/standards/entities/standard.entity';
import { StandardLog } from 'src/standard-sample/standards/entities/standard.log.entity';
import { AnalysisStandardLog } from 'src/standard-sample/analysis-standards/entities/analysis-standard.log.entity';
import { AnalysisStandard } from 'src/standard-sample/analysis-standards/entities/analysis-standard.entity';
import { AnalysisStandardResultLog } from 'src/standard-sample/analysis-standard-results/entities/analysis-standard-result.log.entity';
import { AnalysisStandardResult } from 'src/standard-sample/analysis-standard-results/entities/analysis-standard-result.entity';
import { ResultGradeLevel } from 'src/result-grade/result-grade-levels/entities/result-grade-level.entity';
import { ResultGradeLevelLog } from 'src/result-grade/result-grade-levels/entities/result-grade-level.log.entity';
import { ServiceLaboratoryLog } from 'src/service-type/service-laboratories/entities/service-laboratory.log.entity';
import { ServiceLaboratory } from 'src/service-type/service-laboratories/entities/service-laboratory.entity';
import { ServiceCategoryLog } from 'src/service-type/service-categories/entities/service-category.log.entity';
import { ServiceCategory } from 'src/service-type/service-categories/entities/service-category.entity';
import { StandardCertificateLog } from 'src/standard-sample/standard-certificates/entities/standard-certificate.log.entity';
import { StandardCertificate } from 'src/standard-sample/standard-certificates/entities/standard-certificate.entity';
import { FertilizerMajorLandScore } from 'src/sample/fertilizer-major-land-scores/entities/fertilizer-major-land-score.entity';
import { FertilizerMajorLandScoreLog } from 'src/sample/fertilizer-major-land-scores/entities/fertilizer-major-land-score.log.entity';
import { FarmerLog } from 'src/farmers/entities/farmer.log.entity';
import { Farmer } from 'src/farmers/entities/farmer.entity';
import { FertilizerMajorLog } from 'src/fertilizer/fertilizer-majors/entities/fertilizer-major.log.entity';
import { FertilizerMajor } from 'src/fertilizer/fertilizer-majors/entities/fertilizer-major.entity';
import { FertilizerMinorLog } from 'src/fertilizer/fertilizer-minors/entities/fertilizer-minor.log.entity';
import { FertilizerMinor } from 'src/fertilizer/fertilizer-minors/entities/fertilizer-minor.entity';
import { ServiceFertilizerMajorUsageLog } from 'src/fertilizer/service-fertilizer-major-usages/entities/service-fertilizer-major-usage.log.entity';
import { ServiceFertilizerMajorUsage } from 'src/fertilizer/service-fertilizer-major-usages/entities/service-fertilizer-major-usage.entity';
import { ServiceFertilizerMinorUsageLog } from 'src/fertilizer/service-fertilizer-minor-usages/entities/service-fertilizer-minor-usage.log.entity';
import { ServiceFertilizerMinorUsage } from 'src/fertilizer/service-fertilizer-minor-usages/entities/service-fertilizer-minor-usage.entity';
import { ServiceFertilizerMinor } from 'src/fertilizer/service-fertilizer-minors/entities/service-fertilizer-minor.entity';
import { ServiceFertilizerMinorLog } from 'src/fertilizer/service-fertilizer-minors/entities/service-fertilizer-minor.log.entity';
import { UsageType } from 'src/fertilizer/usage-types/entities/usage-type.entity';
import { UsageTypeLog } from 'src/fertilizer/usage-types/entities/usage-type.log.entity';
import { Laboratory } from 'src/laboratory/laboratories/entities/laboratory.entity';
import { LaboratoryLog } from 'src/laboratory/laboratories/entities/laboratory.log.entity';
import { LaboratorySetting } from 'src/laboratory/laboratory-settings/entities/laboratory-setting.entity';
import { LaboratorySettingLog } from 'src/laboratory/laboratory-settings/entities/laboratory-setting.log.entity';
import { MachineType } from 'src/laboratory/machine-types/entities/machine-type.entity';
import { MachineTypeLog } from 'src/laboratory/machine-types/entities/machine-type.log.entity';
import { Land } from 'src/lands/entities/land.entity';
import { LandLog } from 'src/lands/entities/land.log.entity';
import { Unit } from 'src/reference-data/units/entities/unit.entity';
import { UnitLog } from 'src/reference-data/units/entities/unit.log.entity';
import { ResultGrade } from 'src/result-grade/result-grades/entities/result-grade.entity';
import { ResultGradeLog } from 'src/result-grade/result-grades/entities/result-grade.log.entity';
import { Book } from 'src/sample/books/entities/book.entity';
import { BookLog } from 'src/sample/books/entities/book.log.entity';
import { FertilizerMajorLandUsage } from 'src/sample/fertilizer-major-land-usages/entities/fertilizer-major-land-usage.entity';
import { FertilizerMajorLandUsageLog } from 'src/sample/fertilizer-major-land-usages/entities/fertilizer-major-land-usage.log.entity';
import { FertilizerMinorLandUsage } from 'src/sample/fertilizer-minor-land-usages/entities/fertilizer-minor-land-usage.entity';
import { FertilizerMinorLandUsageLog } from 'src/sample/fertilizer-minor-land-usages/entities/fertilizer-minor-land-usage.log.entity';
import { QrCodeLab } from 'src/sample/qr-code-labs/entities/qr-code-lab.entity';
import { QrCodeLabLog } from 'src/sample/qr-code-labs/entities/qr-code-lab.log.entity';
import { QrCode } from 'src/sample/qr-codes/entities/qr-code.entity';
import { QrCodeLog } from 'src/sample/qr-codes/entities/qr-code.log.entity';
import { Result } from 'src/sample/results/entities/result.entity';
import { ResultLog } from 'src/sample/results/entities/result.log.entity';
import { SampleBlankResult } from 'src/sample/sample-blank-results/entities/sample-blank-result.entity';
import { SampleBlankResultLog } from 'src/sample/sample-blank-results/entities/sample-blank-result.log.entity';
import { SampleBlank } from 'src/sample/sample-blanks/entities/sample-blank.entity';
import { SampleBlankLog } from 'src/sample/sample-blanks/entities/sample-blank.log.entity';
import { ServiceCalendar } from 'src/service-calendars/entities/service-calendar.entity';
import { ServiceCalendarLog } from 'src/service-calendars/entities/service-calendar.log.entity';
import { ServiceType } from 'src/service-type/service-types/entities/service-type.entity';
import { ServiceTypeLog } from 'src/service-type/service-types/entities/service-type.log.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { ShopLog } from 'src/shops/entities/shop.log.entity';
import { User } from 'src/users/entities/user.entity';
import { UserLog } from 'src/users/entities/user.log.entity';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
} from 'typeorm';

const entityToLogMap = new Map<Function, Function>([
  [Farmer, FarmerLog],
  [Bus, BusLog],
  [Book, BookLog],
  [ServiceType, ServiceTypeLog],
  [Unit, UnitLog],
  [ServiceCalendar, ServiceCalendarLog],
  [ResultGrade, ResultGradeLog],
  [MachineType, MachineTypeLog],
  [Shop, ShopLog],
  [Laboratory, LaboratoryLog],
  [LaboratorySetting, LaboratorySettingLog],
  [LaboratorySettingDetail, LaboratorySettingDetailLog],
  [ConvertOmSetting, ConvertOmSettingLog],
  [SoilGrade, SoilGradeLog],
  [SoilGradeLevel, SoilGradeLevelLog],
  [Standard, StandardLog],
  [AnalysisStandard, AnalysisStandardLog],
  [AnalysisStandardResult, AnalysisStandardResultLog],
  [ResultGradeLevel, ResultGradeLevelLog],
  [ServiceLaboratory, ServiceLaboratoryLog],
  [ServiceCategory, ServiceCategoryLog],
  [StandardCertificate, StandardCertificateLog],
  [FertilizerMajorLandScore, FertilizerMajorLandScoreLog],
  [FertilizerMajor, FertilizerMajorLog],
  [FertilizerMinor, FertilizerMinorLog],
  [ServiceFertilizerMajorUsage, ServiceFertilizerMajorUsageLog],
  [ServiceFertilizerMinorUsage, ServiceFertilizerMinorUsageLog],
  [ServiceFertilizerMinor, ServiceFertilizerMinorLog],
  [UsageType, UsageTypeLog],
  [Land, LandLog],
  [FertilizerMajorLandUsage, FertilizerMajorLandUsageLog],
  [FertilizerMinorLandUsage, FertilizerMinorLandUsageLog],
  [QrCodeLab, QrCodeLabLog],
  [QrCode, QrCodeLog],
  [Result, ResultLog],
  [SampleBlankResult, SampleBlankResultLog],
  [SampleBlank, SampleBlankLog],
  [User, UserLog],
]);

@EventSubscriber()
export class LoggingSubscriber implements EntitySubscriberInterface {
  constructor(
    // **[FIX]** Inject ทั้ง 2 connections
    @InjectDataSource('default') defaultDataSource: DataSource,
    @InjectDataSource('logs') private readonly logsDataSource: DataSource
  ) {
    // **[FIX]** ลงทะเบียน subscriber กับ connection หลัก
    defaultDataSource.subscribers.push(this);
  }

  // ... (ส่วนที่เหลือของ class เหมือนเดิม) ...
  async afterInsert(event: InsertEvent<any>) {
    const LogEntity = entityToLogMap.get(event.entity.constructor);
    if (!LogEntity) return;

    const logRepository = this.logsDataSource.getRepository(LogEntity);

    const logData = {
      ...event.entity,
      insertedAt: Date.now(),
      deletedAt: null,
    };

    const newLog = logRepository.create(logData);
    await logRepository.save(newLog);
  }

  async afterUpdate(event: UpdateEvent<any>) {
    const LogEntity = entityToLogMap.get(event.metadata.target as Function);
    if (!LogEntity || !event.databaseEntity || !event.entity) return;

    const logRepository = this.logsDataSource.getRepository(LogEntity);
    const now = Date.now();
    const entityIdField = event.metadata.primaryColumns[0].propertyName;
    const entityId = event.databaseEntity[entityIdField];

    const latestLog = await logRepository.findOne({
      where: { [entityIdField]: entityId, deletedAt: null },
      order: { insertedAt: 'DESC' },
    });

    if (latestLog) {
      latestLog.deletedAt = now;
      await logRepository.save(latestLog);
    }

    const newLogData = {
      ...event.databaseEntity,
      ...event.entity,
      insertedAt: now,
      deletedAt: null,
    };

    const newLog = logRepository.create(newLogData);
    await logRepository.save(newLog);
  }

  async beforeRemove(event: RemoveEvent<any>) {
    // FIX: เพิ่มโค้ดสำหรับตรวจสอบว่า event.entity มีค่าหรือไม่
    if (!event.entity) {
      return; // ถ้าไม่มี ให้จบการทำงานทันที
    }

    const LogEntity = entityToLogMap.get(event.entity.constructor);
    if (!LogEntity) return;

    const entityBeingRemoved = event.entity;
    const currentUserId = entityBeingRemoved.removedBy;

    if (!currentUserId) {
      console.error(
        `[Subscriber] Could not find 'removedBy' userId on the entity for DELETE log.`
      );
      return;
    }

    const logRepository = this.logsDataSource.getRepository(LogEntity);
    const entityIdField = event.metadata.primaryColumns[0].propertyName;
    const entityId = entityBeingRemoved[entityIdField];
    const now = Date.now();

    const latestLog = await logRepository.findOne({
      where: { [entityIdField]: entityId, deletedAt: null },
      order: { insertedAt: 'DESC' },
    });

    if (latestLog) {
      latestLog.deletedAt = now;
      await logRepository.save(latestLog);
    }

    const logData = {
      ...entityBeingRemoved,
      insertedAt: now,
      deletedAt: now,
    };

    const deleterInfoField = this.logsDataSource
      .getMetadata(LogEntity)
      .columns.find(
        col =>
          col.propertyName === 'updateUid' || col.propertyName === 'updatedUid'
      );
    if (deleterInfoField) {
      logData[deleterInfoField.propertyName] = currentUserId;
    }

    const newLog = logRepository.create(logData);
    await logRepository.save(newLog);
  }
}
