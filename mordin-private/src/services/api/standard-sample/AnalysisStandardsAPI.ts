import api from '../../Axios';

import {
  CreateAnalysisStandardInput,
  AnalysisStandardInterface,
  UpdateAnalysisStandardResultDto,
  InputCrmCertificateCompositeDto,
} from '@/types/standard-sample/AnalysisStandards';

export async function createAnalysisStandard(
  data: CreateAnalysisStandardInput
) {
  try {
    const response = await api.post('/analysis-standards', data);
    console.log('responsedataAPI', response);
    return response.data;
  } catch (error) {
    console.error('Cannot create analysis standard:', error);
    throw error;
  }
}

export async function getAnalysisStandardsByCalendar(
  serviceCalendarId: number
): Promise<AnalysisStandardInterface[]> {
  try {
    const response = await api.get(
      `/analysis-standards/calendar/${serviceCalendarId}`
    );
    console.log('getAnalysisStandardsByCalendarData', response);
    return response.data;
  } catch (error) {
    console.error('Cannot fetch analysis standards by calendar:', error);
    throw error;
  }
}

/** BLANK / SAMPLE: อัปเดต preValue ของ analysis-standard-results */
export async function inputAnalysisStandardResults(
  payload: UpdateAnalysisStandardResultDto[]
) {
  const { data } = await api.patch('/analysis-standard-results/input', payload);
  return data; // { updatedCount, data }
}
// 🔁 alias
export const inputBlankResults = inputAnalysisStandardResults;

export async function deleteAnalysisStandard(analysisStandardId: number) {
  const { data } = await api.delete(
    `/analysis-standards/${analysisStandardId}`
  );
  return data;
}

/** แก้ไขจำนวน repeat ของมาตรฐานที่บันทึกแล้ว */
export async function updateAnalysisStandardRepeat(
  analysisStandardId: number,
  repeatCount: number
) {
  const { data } = await api.patch(
    `/analysis-standards/${analysisStandardId}`,
    { repeatCount }
  );
  return data;
}

/** CRM: อัปเดต certificate_value ของ standard_certificates (composite key: standard_id + laboratory_id) */
export async function inputStandardCertificates(
  payload: InputCrmCertificateCompositeDto[]
) {
  const { data } = await api.patch('/standard-certificates/input', payload);
  return data;
}
