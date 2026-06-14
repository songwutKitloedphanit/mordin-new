import { ServiceFertilizerMinorInput } from '../../../types/fertilizer/ServiceFertilizerMinor';
import api from '../../Axios';

export async function getServiceFertilizerMinorById(id: number) {
  try {
    const response = await api.get(`/service-fertilizer-minors/${id}`);
    return response.data;
  } catch (error) {
    console.error('Cannot get service fertilizer minor by id: ', error);
    throw error;
  }
}

export async function updateServiceFertilizerMinor(
  id: number,
  data: ServiceFertilizerMinorInput
) {
  try {
    const response = await api.patch(`/service-fertilizer-minors/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Cannot update service fertilizer minor: ', error);
    throw error;
  }
}
