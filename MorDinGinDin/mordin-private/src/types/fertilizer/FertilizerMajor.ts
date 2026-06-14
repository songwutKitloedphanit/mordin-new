import { BaseSearchAndPaginationParams } from '../common/BaseSearch';
import { Unit } from '../reference-data/Units';
import { SoilGradeLevelInterface } from '../soil-grade/SoilGradeLevels';
import { SoilGradeInterface } from '../soil-grade/SoilGrades';
import { User } from '../User';

import { ServiceFertilizerMajorUsageInfo } from './ServiceFertilizerMajor';

export enum FertilizerMajorTypes {
  Foliar = 'foliar',
  Liquid = 'liquid',
  Granular = 'granular',
  Organic = 'organic',
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FertilizerMajorSeachAndPaginationParams
  extends BaseSearchAndPaginationParams {}

export interface FertilizerMajor {
  fertilizerMajorId: number;
  type: FertilizerMajorTypes;
  formular: string;
  N: number;
  P: number;
  K: number;
  quantity: number;
  unitId: number;
  price: number;
  note?: string;
  updatedAt: number;
  updateUid: number | null;
  priceperUnit: number;
}

export interface FertilizerMajorInfo extends FertilizerMajor {
  updateUser: User;
  unit: Unit;
}

export interface FertilizerMajorInput {
  type: FertilizerMajorTypes;
  N: number | null;
  P: number | null;
  K: number | null;
  quantity: number | null;
  unitId: number | null;
  price: number | null;
  note?: string;
}

export interface FertilizerMajorLandUsages {
  fertilizerMajorLandUsageId: number;
  serviceFertilizerMajorUsageId: number;
  bookId: number;
  fertilizerMajorId: number;
  updatedAt: number;
  grade: number;
  gradeText: string;
  formula: string;
  useRate: number;
  costPerRai: number;
  serviceFertilizerMajorUsage: ServiceFertilizerMajorUsageInfo;
}

export interface FertilizerMajorLandScores {
  fertilizerMajorLandScoreId: number;
  soilGradeId: number;
  bookId: number;
  resultId: number;
  soilGradeLevelId: number;
  comment: number;
  resultValue: number;
  commentUid: number;
  updatedAt: number;
  updatedUid: number;
  soilGrade: SoilGradeInterface;
  soilGradeLevel: SoilGradeLevelInterface;
}

export interface FertilizerSummary {
  majorCount: number;
  majorAvgPricePerSack: number;
  minorCount: number;
  minorAvgPricePerKg: number;
}
