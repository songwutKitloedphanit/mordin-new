import { SoilGradeLevelInterface } from '../soil-grade/SoilGradeLevels';

import { FertilizerMajorInfo } from './FertilizerMajor';

export interface usageType {
  usageTypeId: number;
  name: string; // Example: "ปุ๋ยแต่งหน้า", "ปุ๋ยรองพื้น", "ปุ๋ยเพิ่มผลผลิต"
}

export interface ServiceFertilizerMajorUsage {
  serviceFertilizerMajorUsageId: number;
  serviceCategoryId: number;
  usageTypeId: number;
  soilGradeLevelId: number;
  fertilizerMajorId: number;
  volume: number;
  updateUid: number;
  updatedAt: number;
}

export interface ServiceFertilizerMajorUsageInfo
  extends ServiceFertilizerMajorUsage {
  // updateUser: User;
  soilGradeLevel: SoilGradeLevelInterface;
  fertilizerMajor: FertilizerMajorInfo;
  // serviceCategory: ServiceCategory;
  usageType: usageType;
}

//========================================================================================

export interface ServiceFertilizerMajorUsageInput {
  serviceFertilizerMajorUsageId: number | null;
  // serviceCategoryId: number | null;
  // usageTypeId: number | null;
  // soilGradeLevelId: number | null;
  fertilizerMajorId: number | null;
  volume: number | null;
}
