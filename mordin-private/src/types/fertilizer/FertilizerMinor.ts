import { Unit } from '../reference-data/Units';
import { User } from '../User';

export interface FertilizerMinor {
  fertilizerMinorId: number;
  name: string;
  pricePerUnit: number;
  unitId: number;
  benefit: string;
  note?: string;
  updateUid: number;
  updatedAt: number;
}

export interface FertilizerMinorInfo extends FertilizerMinor {
  unit: Unit;
  updateUser: User;
}

export interface FertilizerMinorInput {
  name: string;
  pricePerUnit: number;
  unitId: number;
  benefit: string;
  note?: string;
}

export interface FertilizerMinorLandUsages {
  fertilizerMinorLandUsageId: number;
  fertilizerMinorLandUsages: number;
  serviceFertilizerMajorUsageId: number;
  bookId: number;
  resultId: number;
  updatedAt: Date;
  level: number;
  fertilizerMinorId: number;
  fertilizerMinorName: number;
  gradeText: string;
  formula: string;
  useRatePerRai: number;
  totalUsage: number;
  pricePerRai: number;
  totalPrice: number;
  updatedUid: number;
  fertilizerMinor: FertilizerMinorInfo;
}
