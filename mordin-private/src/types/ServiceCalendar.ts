import { Subdistrict } from './address';
import { Bus } from './Bus';
import { BaseSearchAndPaginationParams } from './common/BaseSearch';
import { LaboratorySettingInfo } from './laboratory/LaboratorySetting';

export interface CalendarSearch extends BaseSearchAndPaginationParams {
  year?: number;
  month?: number;
}

export interface Calendar {
  serviceCalendarId: number;
  date: Date;
  numberOfSamples: number | null;
  numberOfBookings: number | null;
  numberOfExaminations: number | null;
  busId: number | null;
  subdistrictCode: string;
  village: string;
  latitude: number;
  longitude: number;
  description: string;
  createdAt: number;
  updatedAt: number;
}

export interface CalendarInfoInterface extends Calendar {
  bus: Bus;
  subdistrict: Subdistrict;
  laboratorySettings: LaboratorySettingInfo[];
}

export interface CalendarInput {
  date: Date;
  numberOfSamples: number | null;
  numberOfBookings: number | null;
  numberOfExaminations: number | null;
  busId: number | null;
  subdistrictCode: string;
  village: string;
  latitude: string;
  longitude: string;
  description: string;
  mapLink?: string | number | undefined;
}

export interface SearchServiceCalendar extends BaseSearchAndPaginationParams {
  month?: number;
  year?: number;
}

// ประเภทข้อมูลสำหรับ Status ใหม่
type SettingStatus = 'set' | 'not_set';
type AnalysisResultStatus =
  | 'complete'
  | 'in_progress'
  | 'not_started'
  | 'no_samples';
type SampleLeftStatus =
  | 'all_available'
  | 'partially_picked'
  | 'all_picked'
  | 'no_samples';
type ApprovedStatus =
  | 'none_approved'
  | 'partially_approved'
  | 'all_approved'
  | 'no_samples';

// ประเภทข้อมูลสำหรับผลลัพธ์สุดท้าย
export type ServiceCalendarWithStatus = Calendar & {
  settingStatus: SettingStatus;
  analysisResultStatus: AnalysisResultStatus;
  sampleLeftStatus: SampleLeftStatus;
  approvedStatus: ApprovedStatus;
};

export interface ServiceCalendarSummary {
  totalSamples: number;
  remaining: number;
  totalBookings: number;
  analyzed: number;
}
