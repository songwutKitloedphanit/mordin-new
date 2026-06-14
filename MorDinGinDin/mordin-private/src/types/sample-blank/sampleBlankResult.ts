import { LaboratorySettingInfo } from '../laboratory/LaboratorySetting';

export interface sampleBlankResultInput {
  sampleBlankResultId?: number;
  laboratorySettingId: number;
  laboratoryId: number;
  repeatNumber: number;
  preValue: number | null;
  certificate: number;
  recordedType: RecordTypeEnum;
}

export interface sampleBlankResultInfo {
  resultId: number;
  sampleBlankResultId: number;
  sampleBlankId: number;
  laboratoryId: number;
  repeatNumber: number;
  recordedAt: string;
  recordedType: RecordTypeEnum;
  recordedUid: number;
  postValue: number | null;
  preValue: number | null;
  certificate: number;
  laboratorySettingId: number;
  laboratorySetting: LaboratorySettingInfo;
  resultGradeLevel: Record<string, number | string>;
}

export enum RecordTypeEnum {
  SCAN = 'scan',
  FILE = 'file',
  INPUT = 'input',
}
