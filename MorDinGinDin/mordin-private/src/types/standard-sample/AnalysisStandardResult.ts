import { LaboratorySettingInfo } from '@/types/laboratory/LaboratorySetting';
export interface AnalysisStandardResult {
  analysisStandardResultId: number;
  analysisStandardId: number;
  laboratoryId: number;
  repeatNumber: number;
  recordedAt: number | null;
  recordedType: string | null;
  recordedUid: number | null;
  preValue: number | null;
  postValue: number | null;
  laboratorySettingId: number;
  laboratorySetting?: LaboratorySettingInfo;
}
