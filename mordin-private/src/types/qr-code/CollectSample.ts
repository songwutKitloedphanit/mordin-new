export interface CollectSampleInput {
  farmerId?: number | null;
  landId?: number | null;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  thaiNationalId: string;
  serviceAreaId: number;
  landCode: string;
  landName: string;
  areaSize: number | '';
  provinceCode: number | '';
  districtCode: number | '';
  subdistrictCode: string;
  zipCode: number | '';
  serviceTypeId: number;
  latitude: string;
  longitude: string;
}

export interface CollectExamInput {
  farmerId?: number | null;
  landId?: number | null;
  serviceTypeId?: number | null;
  latitude?: string | null;
  longitude?: string | null;
}
