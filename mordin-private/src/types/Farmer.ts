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
  birthDate?: string;
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
  birthDate?: string;
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
  birthDate?: string;
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

export interface FarmerPublicLoginInput {
  loginType: 'thai_id';
  identifier: string;
  phone: string;
}

export interface FarmerPublicNamePhoneInput {
  firstName: string;
  phone: string;
}

export interface FarmerPublicProfile {
  farmerId: number;
  firstName: string;
  lastName: string;
  phone: string;
  birthDate?: string;
  thaiFarmerId?: string;
  factory?: {
    factoryId: number;
    name: string;
    initial: string | null;
  };
  serviceArea?: {
    serviceAreaId: number;
    code: string | null;
    name: string | null;
  };
  landCount?: number;
  landSizeSummary?: number;
  lands: FarmerPublicLand[];
}

export interface FarmerPublicLand {
  landId: number;
  landCode?: string;
  name: string;
  areaSize: number;
  latitude?: number;
  longitude?: number;
  subdistrictCode: string;
  zipCode: number;
  subdistrict?: {
    code: number;
    zipCode: number;
    latitude?: number;
    longitude?: number;
    district?: {
      code: number;
      province?: {
        code: number;
      };
    };
  };
}
