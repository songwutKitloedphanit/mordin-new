import api from '@/services/Axios';
import { ResultGradeUpdate } from '@/types/result-grade/ResultGrade';

export async function getResultGradeById(id: number) {
  try {
    const response = await api.get(`/result-grades/${id}`);
    return response.data;
  } catch (error) {
    console.log('Can not get result grade', error);
    throw error;
  }
}

export async function updateResultGrade(id: number, data: ResultGradeUpdate) {
  try {
    console.log('data', data);

    const response = await api.patch(`/result-grades/${id}`, data);
    return response.data;
  } catch (error) {
    console.log('Can not update result grade', error);
    throw error;
  }
}
