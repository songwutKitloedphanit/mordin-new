import { Subdistrict } from '../address';
import { BaseSearchAndPaginationParams } from '../common/BaseSearch';
import { FarmerInfo } from '../Farmer';
import { LaboratorySettingInfo } from '../laboratory/LaboratorySetting';
import { LandInfoInterface } from '../Land';
import { ResultGradeLevel } from '../result-grade/ResultGradeLevel';
import { sampleBlankResultInfo } from '../sample-blank/sampleBlankResult';
import { ServiceAreaInfo } from '../service-area/ServiceAreas';
import { ServiceTypeInfo } from '../service-type/ServiceTypes';
import { Calendar } from '../ServiceCalendar';
import { User } from '../User';

export enum QrCodeTypeEnum {
  Booking = 'booking',
  Walkin = 'walkin',
  Spread = 'spread',
}

export enum SampleStatusEnum {
  DISTRIBUTED = 'distributed',
  COLLECTED = 'collected',
  RECEIVED = 'received',
  ANALYZING = 'analyzing',
  ANALYZED = 'analyzed',
  APPROVED = 'approved',
}

export interface QrCode {
  book: Book;
  qrCodeId: number;
  qrCode: string;
  createdUid: number;
  type: QrCodeTypeEnum;
  serviceAreaId?: number;
  serviceCalendarId?: number;
  dirtWeightOm: number;
  dirtWeightMehlich: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  status: SampleStatusEnum;
  thaiNationalId: string;
  landCode: string;
  landName: string;
  serviceTypeId: number;
  createdAt: number;
  serviceArea?: ServiceAreaInfo;
}

export interface QrCodeInfo extends QrCode {
  result: Result[];
  createdUser: User;
  serviceCalendar: Calendar;
  serviceArea: ServiceAreaInfo;
}
export interface Result extends QrCode {
  resultId: number;
  bookId: number;
  laboratoryId: number;
  serviceTypeId: number;
  repeatNumber: number;
  recordedAt: number;
  postValue: number;
  preValue: number;
  resultGradeId: number;
  resultGradeLevel: ResultGradeLevel;
  laboratorySetting: LaboratorySettingInfo;
}

export interface QrCodeInput {
  type: QrCodeTypeEnum;
  serviceAreaId?: number;
  serviceCalendarId?: number;
}

export interface Book {
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
  subdistrictCode?: string;
  zipCode?: number;
  subdistrict?: Subdistrict;
  sampleCode: string;
  repeatCount: number;
  sampleReceivedAt: number;
  sampleReceivedUid: number;
  receivedServiceCalendarId: number;
  analysisServiceCalendarId: number;
  serviceCalendarId: number;
  serviceAreaId: number;
  qrCode: QrCode;
  land: LandInfoInterface;
  serviceType: ServiceTypeInfo;
  sampleReceivedUser: User;
  sampleAnalysisNumber: number;
  serviceCalendar: Calendar;
  results: sampleBlankResultInfo[];
  serviceArea: ServiceAreaInfo;
}

export interface QrCodeSearch extends BaseSearchAndPaginationParams {
  status?: SampleStatusEnum[] | SampleStatusEnum;
  type?: QrCodeTypeEnum;
  serviceAreaId?: number;
  year?: number;
  serviceCalendarId?: number;
  receivedServiceCalendarId?: number;
  factoryId?: number;
}

export const typeLabels: Record<QrCodeTypeEnum, string> = {
  [QrCodeTypeEnum.Booking]: 'จอง',
  [QrCodeTypeEnum.Walkin]: 'Walk-in',
  [QrCodeTypeEnum.Spread]: 'กระจาย',
};

export interface QrCodeSummary {
  total: number;
  distributed: number;
  reserved: number;
  completed: number;
}
