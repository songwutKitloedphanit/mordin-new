import api from '../../Axios';

import {
  DashboardResponse,
  GetGraphFilterParams,
} from '@/types/fertilizer/FertilizerMajorLandScore';
export interface FertilizerSummaryResponse {
  landCount: number; // ไร่
  farmerCount: number; // คน
  sampleCount: number; // ตัวอย่าง
  serviceCalendarCount: number; // วัน
}
export async function getFertilizerMajorLandScoreGraph(
  filter: GetGraphFilterParams
): Promise<DashboardResponse> {
  try {
    const response = await api.get('/fertilizer-major-land-scores/graph', {
      params: filter,
    });
    return response.data;
  } catch (error) {
    console.error('Cannot get fertilizer major land scores:', error);
    throw error;
  }
}

export async function getFertilizerMajorLandScoreSummary(): Promise<FertilizerSummaryResponse> {
  try {
    const response = await api.get('/fertilizer-major-land-scores/summary');
    return response.data;
  } catch (error) {
    console.error('Cannot get fertilizer major land scores summary:', error);
    throw error;
  }
}
