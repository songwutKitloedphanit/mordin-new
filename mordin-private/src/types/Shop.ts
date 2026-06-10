// D:\mitrpol\mordin-private\src\types\Shop.ts
export interface Shop {
  id: number;
  name: string;
  phone: string;
  owner: string;
  facebook?: string;
  line?: string;
  shopAddress: string;
  province?: string;
  district?: string;
  subdistrict: string;
  latitude: number;
  longitude: number;
  zipcode: string;
  createdAt?: number;
  updatedAt: number | string;
  images?: string;
}

export interface ShopInput {
  name: string;
  phone: string;
  owner: string;
  facebook?: string;
  line?: string;
  houseNumber?: string;
  street?: string;
  village?: string;
  shopAddress: string;
  zipcode: string;
  subdistrict: string;
  district?: string;
  province?: string;
  images?: File[];
}

export interface ShopSummary {
  totalShops: number;
}
