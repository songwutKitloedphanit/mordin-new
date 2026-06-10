import {
  SoilGradeInput,
  SoilGradeUpdateInput,
} from '../../../types/soil-grade/SoilGrades';
import api from '../../Axios';

export async function getAllSoilGrades() {
  try {
    const response = await api.get('/soil-grades');
    return response.data;
  } catch (error) {
    console.error('Cannot get soil grades: ', error);
    throw error;
  }
}

export async function createSoilGrade(soilGradeFormData: SoilGradeInput) {
  try {
    const response = await api.post('/soil-grades', soilGradeFormData);
    return response.data;
  } catch (error) {
    console.error('Cannot create soil grade: ', error);
    throw error;
  }
}

export async function getSoilGradeById(id: number) {
  try {
    const response = await api.get(`/soil-grades/${id}`);
    return response.data;
  } catch (error) {
    console.error('Cannot get soil grade by id: ', error);
    throw error;
  }
}

export async function updateSoilGrade(
  soilGradeFormData: SoilGradeUpdateInput[]
) {
  try {
    console.log('soilGradeFormData: ', soilGradeFormData);

    const response = await api.patch(`/soil-grades`, soilGradeFormData);
    return response.data;
  } catch (error) {
    console.error('Cannot update soil grade: ', error);
    throw error;
  }
}

export async function deleteSoilGrade(id: number) {
  try {
    const response = await api.delete(`/soil-grades/${id}`);
    return response.data;
  } catch (error) {
    console.error('Cannot delete soil grade: ', error);
    throw error;
  }
}

export async function getSoilGradeByServiceTypeId(serviceTypeId: number) {
  try {
    const response = await api.get(
      `/soil-grades/service-type/${serviceTypeId}`
    );
    return response.data;
  } catch (error) {
    console.error('Can not get soil grade by service type data', error);
    throw error;
  }
}
