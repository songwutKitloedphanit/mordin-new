import { Laboratory } from '../Laboratory';
import { Unit } from '../reference-data/Units';
import { User } from '../User';

import { FertilizerMinorInfo } from './FertilizerMinor';

export interface ServiceFertilizerMinor {
  serviceFertilizerMinorId: number;
  serviceTypeId: number;
  fertilizerMinorId: number;
  laboratoryId: number;
  unitId: number;
  updateUid: number;
  updatedAt: number;
}

export interface ServiceFertilizerMinorInfo extends ServiceFertilizerMinor {
  fertilizerMinor: FertilizerMinorInfo;
  updateUser: User;
  unit: Unit;
  laboratory: Laboratory;
  serviceFertilizerMinorUsages: ServiceFertilizerMinorUsage[];
}

export interface ServiceFertilizerMinorInput {
  serviceTypeId: number | null;
  fertilizerMinorId: number | null;
  laboratoryId: number | null;
  unitId: number | null;
  serviceFertilizerMinorUsages: ServiceFertilizerMinorUsageInput[];
}

// =======================================================================================================================

export interface ServiceFertilizerMinorUsage {
  serviceFertilizerMinorId: number;
  level: number;
  cutoffValue: number;
  cutoffText: string;
  fertilizerUsageValue: number;
  updateUid: number;
  updatedAt: number;
}

export interface ServiceFertilizerMinorUsageInfo
  extends ServiceFertilizerMinorUsage {
  updateUser: User;
}

export interface ServiceFertilizerMinorUsageInput {
  level: number | null;
  cutoffValue: number | null;
  cutoffText: string | null;
  fertilizerUsageValue: number | null;
}

// =======================================================================================================================
