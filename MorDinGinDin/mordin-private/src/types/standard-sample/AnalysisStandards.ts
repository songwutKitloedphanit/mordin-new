import { AnalysisStandardResult } from './AnalysisStandardResult';
import { StandardInfo } from './Standard';

export enum StandardType {
  CRM = 'crm',
  BLANK = 'blank',
}

export interface StandardItemInput {
  standardId?: number;
  blankName?: string;
  repeatCount: number;
  type: StandardType;
}

export interface CreateAnalysisStandardInput {
  serviceCalendarId: number;
  standard: StandardItemInput[];
}
export interface AnalysisStandardInterface {
  analysisStandardId: number;
  serviceCalendarId: number;
  standardId?: number;
  name?: string;
  repeatCount: number;
  type: 'crm' | 'blank';
  updatedAt: number;
  standard?: StandardInfo;
  analysisStandardResults: AnalysisStandardResult[];
}
export type UpdateAnalysisStandardResultDto = {
  analysisStandardResultId: number;
  // ถ้า “ไม่ใช้ null” → เป็น number
  preValue: number;
  recordedType?: 'input' | 'file' | 'scan';
};

// (ถ้าต้อง back-compat กับชื่อเดิม)
export type InputBlankResultDto = UpdateAnalysisStandardResultDto;

// CRM/Standard certificates (อีกตาราง)
export type InputCrmCertificateCompositeDto = {
  standardId: number;
  laboratoryId: number;
  certificateValue: number; // ถ้าไม่ใช้ null
  recordedType?: 'input' | 'file';
};
