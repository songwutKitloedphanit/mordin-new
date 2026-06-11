export class FarmerPublicLandDto {
  landId!: number;
  landCode?: string;
  name!: string;
  areaSize!: number;
  latitude?: number;
  longitude?: number;
  subdistrictCode!: string;
  zipCode!: number;
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

export class FarmerPublicProfileDto {
  farmerId!: number;
  firstName!: string;
  lastName!: string;
  phone!: string;
  birthDate?: string;
  thaiFarmerId?: string;
  factory?: { factoryId: number; name: string; initial: string | null };
  serviceArea?: {
    serviceAreaId: number;
    code: string | null;
    name: string | null;
  };

  landCount?: number;
  landSizeSummary?: number;
  lands!: FarmerPublicLandDto[];
}

