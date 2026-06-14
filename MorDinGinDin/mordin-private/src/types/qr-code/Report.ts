import { FarmerInfo } from '../Farmer';
import {
  FertilizerMajorLandScores,
  FertilizerMajorLandUsages,
} from '../fertilizer/FertilizerMajor';
import { FertilizerMinorLandUsages } from '../fertilizer/FertilizerMinor';
import { usageType } from '../fertilizer/ServiceFertilizerMajor';
import { LandInfoInterface } from '../Land';
import { ServiceTypeInfo } from '../service-type/ServiceTypes';
import { User } from '../User';

import { QrCode, QrCodeInfo, Result } from './QrCode';

export interface ReportInfo {
  qrCode: QrCodeInfo;
  totalResult: number;
  analyzedResult: number;
}

export interface SampleCodes {
  sampleCodes: string[];
}

export interface BookIds {
  bookIds: number[];
}

export interface PrintReportInterface {
  bookId: number;
  qrCodeId: number;
  landId: number;
  farmerId: number;
  farmer: FarmerInfo;
  serviceTypeId: number;
  bookedAt: number;
  collectSampleAt: number;
  latitude: string;
  longitude: string;
  areaSize: number;
  sampleCode: string;
  repeatCount: number;
  sampleReceivedAt: number;
  sampleReceivedUid: number;
  serviceCalendarId: number;
  serviceAreaId: number;
  qrCode: QrCode;
  land: LandInfoInterface;
  serviceType: ServiceTypeInfo;
  sampleReceivedUser: User;
  sampleAnalysisNumber: number;
  results: Result[];
  usageType: usageType[];
  ferMajorLandScores: FertilizerMajorLandScores[];
  ferMajorLandUsages: FertilizerMajorLandUsages[];
  ferMinorLandUsages: FertilizerMinorLandUsages[];
}
