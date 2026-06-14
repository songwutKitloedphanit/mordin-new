export class FarmerPublicProfileDto {
  farmerId!: number;
  firstName!: string;
  lastName!: string;
  phone!: string;
  thaiFarmerId?: string;
  thaiNationalIdMasked?: string; // ปิดเลขบางส่วนเพื่อความปลอดภัย
  factory?: { factoryId: number; name: string; initial: string | null };
  serviceArea?: { serviceAreaId: number; code: string | null; name: string | null };
  landCount?: number;
  landSizeSummary?: number;
}
