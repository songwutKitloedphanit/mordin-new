import type {
  FeatureCollection,
  Feature,
  Polygon,
  MultiPolygon,
} from 'geojson';

/** ADM1 = จังหวัด */
export type GADM1FeatureProperties = {
  GID_0: string;
  GID_1: string;
  COUNTRY: string;
  NAME_0: string; // ประเทศ
  NAME_1: string; // จังหวัด
  NL_NAME_1: string;
  VARNAME_1: string;
  TYPE_1: string;
  ENGTYPE_1: string;
  CC_1: string;
  HASC_1: string;
  [key: string]: unknown;
};
export type GADM1Feature = Feature<
  Polygon | MultiPolygon,
  GADM1FeatureProperties
>;
export type GADM1GeoJSON = FeatureCollection<
  Polygon | MultiPolygon,
  GADM1FeatureProperties
>;

/** ADM2 = อำเภอ */
export type GADM2FeatureProperties = {
  GID_0: string;
  GID_1: string;
  GID_2: string;
  COUNTRY: string;
  NAME_0: string; // ประเทศ
  NAME_1: string; // จังหวัด
  NL_NAME_1: string;
  NAME_2: string; // อำเภอ
  NL_NAME_2: string;
  VARNAME_2: string;
  TYPE_2: string;
  ENGTYPE_2: string;
  CC_2: string;
  HASC_2: string;
  [key: string]: unknown;
};
export type GADM2Feature = Feature<
  Polygon | MultiPolygon,
  GADM2FeatureProperties
>;
export type GADM2GeoJSON = FeatureCollection<
  Polygon | MultiPolygon,
  GADM2FeatureProperties
>;

/** ADM3 = ตำบล */
export type GADM3FeatureProperties = {
  GID_0: string;
  GID_1: string;
  GID_2: string;
  GID_3: string;
  COUNTRY: string;
  NAME_0: string; // ประเทศ
  NAME_1: string; // จังหวัด
  NL_NAME_1: string;
  NAME_2: string; // อำเภอ
  NL_NAME_2: string;
  NAME_3: string; // ตำบล
  NL_NAME_3: string;
  VARNAME_3: string;
  TYPE_3: string;
  ENGTYPE_3: string;
  CC_3: string;
  HASC_3: string;
  [key: string]: unknown;
};
export type GADM3Feature = Feature<
  Polygon | MultiPolygon,
  GADM3FeatureProperties
>;
export type GADM3GeoJSON = FeatureCollection<
  Polygon | MultiPolygon,
  GADM3FeatureProperties
>;

export enum MapLevel {
  Region = 'region',
  Province = 'province',
  District = 'district',
  Subdistrict = 'subdistrict',
}

export const REGION_PROVINCE_MAPPING: Record<string, string[]> = {
  ภาคเหนือ: [
    'ChiangMai',
    'ChiangRai',
    'Lampang',
    'Lamphun',
    'MaeHongSon',
    'Nan',
    'Phayao',
    'Phrae',
    'Uttaradit',
  ],
  ภาคกลาง: [
    'BangkokMetropolis',
    'Nonthaburi',
    'PathumThani',
    'SamutPrakan',
    'SamutSakhon',
    'SamutSongkhram',
    'NakhonPathom',
    'PhraNakhonSiAyutthaya',
    'AngThong',
    'LopBuri',
    'SingBuri',
    'ChaiNat',
    'Saraburi',
    'NakhonNayok',
  ],
  ภาคตะวันออกเฉียงเหนือ: [
    'NakhonRatchasima',
    'BuriRam',
    'Surin',
    'SiSaKet',
    'UbonRatchathani',
    'Yasothon',
    'Chaiyaphum',
    'AmnatCharoen',
    'NongBuaLamPhu',
    'KhonKaen',
    'UdonThani',
    'Loei',
    'NongKhai',
    'MahaSarakham',
    'RoiEt',
    'Kalasin',
    'SakonNakhon',
    'NakhonPhanom',
    'Mukdahan',
    'BuengKan',
  ],
  ภาคตะวันตก: [
    'Kanchanaburi',
    'Tak',
    'Sukhothai',
    'Phitsanulok',
    'Phichit',
    'Phetchabun',
    'Ratchaburi',
    'PrachuapKhiriKhan',
  ],
  ภาคตะวันออก: [
    'ChonBuri',
    'Rayong',
    'Chanthaburi',
    'Trat',
    'Chachoengsao',
    'PrachinBuri',
    'SaKaeo',
  ],
  ภาคใต้: [
    'Chumphon',
    'Ranong',
    'SuratThani',
    'Phangnga',
    'Phuket',
    'Krabi',
    'NakhonSiThammarat',
    'Trang',
    'Phatthalung',
    'Satun',
    'Songkhla',
    'Pattani',
    'Yala',
    'Narathiwat',
  ],
};
