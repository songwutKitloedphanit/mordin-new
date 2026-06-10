export interface Province {
  code: number;
  nameTh: string;
  nameThShort: string;
  nameEn: string;
  geographyId: number;
}

export interface District {
  code: number;
  nameTh: string;
  nameEn: string;
  provinceCode: number;

  province?: Province;
}

export interface Subdistrict {
  code: string;
  zipCode: string;
  nameTh: string;
  nameEn: string;
  districtCode: number;
  latitude: string;
  longitude: string;

  district?: District;
}

export interface geography {
  id: number;
  name: string;
}
