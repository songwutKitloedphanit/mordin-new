import { FertilizerMinorInput } from '../../../types/fertilizer/FertilizerMinor';
import api from '../../Axios';

export async function getAllFertilizerMinors() {
  try {
    const response = await api.get('/fertilizer-minors');
    return response.data;
  } catch (error) {
    console.error('Cannot get fertilizer minors: ', error);
    throw error;
  }
}

export async function createFertilizerMinor(
  fertilizerMinorFormData: FertilizerMinorInput
) {
  try {
    const response = await api.post(
      '/fertilizer-minors',
      fertilizerMinorFormData
    );
    return response.data;
  } catch (error) {
    console.error('Cannot create fertilizer minor: ', error);
    throw error;
  }
}

export async function getFertilizerMinorById(id: number) {
  try {
    const response = await api.get(`/fertilizer-minors/${id}`);
    return response.data;
  } catch (error) {
    console.error('Cannot get fertilizer minor by id: ', error);
    throw error;
  }
}

export async function updateFertilizerMinor(
  id: number,
  fertilizerMinorFormData: FertilizerMinorInput
) {
  try {
    const response = await api.patch(
      `/fertilizer-minors/${id}`,
      fertilizerMinorFormData
    );
    return response.data;
  } catch (error) {
    console.error('Cannot update fertilizer minor: ', error);
    throw error;
  }
}

export async function deleteFertilizerMinor(id: number) {
  try {
    const response = await api.delete(`/fertilizer-minors/${id}`);
    return response.data;
  } catch (error) {
    console.error('Cannot delete fertilizer minor: ', error);
    throw error;
  }
}
