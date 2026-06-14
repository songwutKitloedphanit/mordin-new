import { Subdistrict } from './address';
import { Farmer } from './Farmer';

export interface Land {
  landId: number;
  landCode: string;
  name: string;
  quotaCode?: string;
  areaSize: number;
  latitude: number;
  longitude: number;
  subdistrictCode: string;
  zipCode: string;
  village: string;
  farmerId: number;
  updatedAt?: number;
}

export interface LandFormInterface {
  landCode?: string;
  name: string;
  quotaCode?: string;
  areaSize: number | '';
  latitude?: number;
  longitude?: number;
  provinceId?: number;
  districtId?: number;
  subdistrictCode: string;
  zipCode?: number;
  village?: string;
  farmerId: number | null;
}

export interface LandInputInterface {
  landCode?: string;
  name: string;
  quotaCode?: string;
  areaSize: number;
  latitude?: string;
  longitude?: string;
  subdistrictCode: string;
  zipCode: number;
  village?: string;
  farmerId: number;
}

export interface LandInfoInterface extends Land {
  farmer: Farmer;
  subdistrict: Subdistrict;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface LandSummary {
  totalLands: number;
  needsImprovementCount: number;
  normalSoilCount: number;
  fertileSoilCount: number;
}
