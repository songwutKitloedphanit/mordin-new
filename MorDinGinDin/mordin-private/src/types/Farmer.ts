import { BaseSearchAndPaginationParams } from './common/BaseSearch';
import { LandInfoInterface } from './Land';
import { FactoryInterface } from './service-area/Factories';
import { ServiceAreaInfo } from './service-area/ServiceAreas';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FarmerSearch extends BaseSearchAndPaginationParams {}

export interface Farmer {
  farmerId: number;
  thaiNationalId?: string;
  thaiFarmerId?: string;
  phone: string;
  firstName: string;
  lastName: string;
  lineUserId?: string;
  factoryId: number | null;
  serviceAreaId: number | null;
  updateUid: number | null;
  updatedAt?: number;
}

export interface FarmerInfo {
  farmerId: number;
  thaiNationalId?: string;
  thaiFarmerId?: string;
  phone: string;
  firstName: string;
  lastName: string;
  lineUserId?: string;
  factoryId: number;
  serviceAreaId: number;
  updateUid: number;
  updatedAt: number;
  landSizeSummary: number;
  landCount: number;
  factory: FactoryInterface;
  serviceArea: ServiceAreaInfo;
  lands: LandInfoInterface[];
}

// ใช้ตอนเพิ่มข้อมูลใหม่
export interface FarmerCreateInput {
  thaiNationalId?: string;
  thaiFarmerId?: string;
  phone: string;
  firstName: string;
  lastName: string;
  factoryId: number | null;
  serviceAreaId: number | null;
}

// ใช้ตอนกรอกฟอร์ม
export interface FarmerFormState {
  cardType: '1' | '2';
  cardId: string;
  name: string;
  lastname: string;
  phone: string;
  factoryId: number;
  serviceAreaId: number;
}

// ใช้ตอนค้นหา
export interface FarmerSearchCriteria {
  name?: string;
  phone?: string;
  thaiNationalId?: string;
  thaiFarmerId?: string;
}

export interface FarmerSummary {
  totalFarmers: number;
  totalLands: number;
  totalSpaces: number;
}
