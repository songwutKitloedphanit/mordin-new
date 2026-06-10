export interface Bus {
  busId: number;
  busNumber: string;
  busName: string;
  licensePlate: string;
  registrationProvinceCode: number;
  workingArea: string;
  note: string;
  updatedAt: number;
}

export interface BusInput {
  busNumber: string;
  busName: string;
  licensePlate: string;
  registrationProvinceCode: number;
  workingArea: string;
  note: string;
}

export interface BusSummary {
  totalBuses: number;
}
