//D:\mitrpol\mordin-private\src\types\SoilAmendment.ts
import { UnitType } from './Fertilizer';

export interface SoilAmendmentCreateInput {
  name: string; // formerly “type”
  pricePerUnit: number;
  benefit: string; // formerly “useful”
  unit: UnitType;
  note?: string;
}

export interface SoilAmendment {
  soilAmendmentId?: number; // PK from your DB
  name: string;
  pricePerUnit: number;
  benefit: string;
  unit: UnitType;
  note?: string;
  createdAt: number; // bigint timestamps
  updatedAt?: number;
}
