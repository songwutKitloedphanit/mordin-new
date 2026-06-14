import { LaboratoryInfoInterface } from '../Laboratory';
import { Calendar } from '../ServiceCalendar';

import { ConvertOmSetting } from './ConvertOmSetting';

export interface LaboratorySettingDetail {
  laboratorySettingId: number;
  numberOfValues: number;
  absorbance: number;
  workingStandard: number;
}

export interface LaboratorySettingDetailInput {
  numberOfValues: number | null;
  absorbance: number | null;
  workingStandard: number | null;
}

export interface LaboratorySetting {
  laboratorySettingId: number;
  laboratoryId: number;
  serviceCalendarId: number;
  workingStandard: number | null;
  rSquared: number | null;
  dirtWeight: number | null;
  extractConcentration: number | null;
  extractAmount: number | null;
  intercept: number | null;
  slope: number | null;
  updateUid: number;
  updatedAt: number;
}
export interface LaboratorySettingInfo extends LaboratorySetting {
  serviceCalendar: Calendar;
  laboratory: LaboratoryInfoInterface;
  laboratorySettingDetails: LaboratorySettingDetail[];
  convertOmSettings: ConvertOmSetting[];
}

export interface LaboratorySettingInput {
  laboratorySettingId: number;
  dirtWeight: number | null;
  extractConcentration: number | null;
  extractAmount: number | null;
}
