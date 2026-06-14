import { StandardInput } from '../../types/standard-sample/Standard';
import api from '../../Axios';
export async function getAllStandards() {
  try {
    const response = await api.get('/standards');
    return response.data;
  } catch (error) {
    console.error('Cannot get standards: ', error);
    throw error;
  }
}

export async function createStandard(StandardFormData: StandardInput) {
  try {
    const response = await api.post('/standards', StandardFormData);
    console.log(StandardFormData);
    return response.data;
  } catch (error) {
    console.error('Cannot create standard: ', error);
    throw error;
  }
}

export async function getStandardById(id: number) {
  try {
    const response = await api.get(`/standards/${id}`);
    return response.data;
  } catch (error) {
    console.error('Cannot get standard by id: ', error);
    throw error;
  }
}

export async function updateStandard(
  id: number,
  StandardFormData: StandardInput
) {
  try {
    const response = await api.patch(`/standards/${id}`, StandardFormData);
    return response.data;
  } catch (error) {
    console.error('Cannot update standard: ', error);
    throw error;
  }
}

export async function deleteStandard(id: number) {
  try {
    const response = await api.delete(`/standards/${id}`);
    return response.data;
  } catch (error) {
    console.error('Cannot delete standard: ', error);
    throw error;
  }
}
