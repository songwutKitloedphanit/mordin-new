import {
  FertilizerMajorInput,
  FertilizerMajorSeachAndPaginationParams,
  FertilizerMajorInfo,
  FertilizerSummary,
} from '../../../types/fertilizer/FertilizerMajor';
import api from '../../Axios';

//Temp function while change into serach and pagination
export async function getAllFertilizerMajors() {
  try {
    const response = await api.get('/fertilizer-majors');
    return response.data;
  } catch (error) {
    console.error('Cannot get all fertilizer majors: ', error);
    throw error;
  }
}

export async function getFertilizerMajors(
  params: FertilizerMajorSeachAndPaginationParams
) {
  try {
    const response = await api.get<{
      data: FertilizerMajorInfo[];
      total: number;
      totalPages: number;
    }>('/fertilizer-majors', { params });
    return response.data;
  } catch (error) {
    console.error('Cannot get fertilizer majors: ', error);
    throw error;
  }
}

export async function createFertilizerMajor(
  fertilizerMajorFormData: FertilizerMajorInput
) {
  try {
    const response = await api.post(
      '/fertilizer-majors',
      fertilizerMajorFormData
    );
    return response.data;
  } catch (error) {
    console.error('Cannot create fertilizer major: ', error);
    throw error;
  }
}

export async function getFertilizerMajorById(id: number) {
  try {
    const response = await api.get(`/fertilizer-majors/${id}`);
    return response.data;
  } catch (error) {
    console.error('Cannot get fertilizer major by id: ', error);
    throw error;
  }
}

export async function updateFertilizerMajor(
  id: number,
  fertilizerMajorFormData: FertilizerMajorInput
) {
  try {
    const response = await api.patch(
      `/fertilizer-majors/${id}`,
      fertilizerMajorFormData
    );
    return response.data;
  } catch (error) {
    console.error('Cannot update fertilizer major: ', error);
    throw error;
  }
}

export async function deleteFertilizerMajor(id: number) {
  try {
    const response = await api.delete(`/fertilizer-majors/${id}`);
    return response.data;
  } catch (error) {
    console.error('Cannot delete fertilizer major: ', error);
    throw error;
  }
}

export async function getFertilizerSummary(): Promise<FertilizerSummary> {
  try {
    const response = await api.get('/fertilizer-majors/summary');
    return response.data;
  } catch (error) {
    console.error('Cannot get fertilizer summary:', error);
    throw error;
  }
}
