import api from '../../Axios';

import { standardSearch } from '@/types/Standard';

export async function getAllStandard() {
  try {
    const response = await api.get('/standards');
    console.log('standard', response);
    return response.data;
  } catch (error) {
    console.error('Can not get all standard: ', error);
    throw error;
  }
}

export async function searchStandard(params: standardSearch) {
  try {
    const response = await api.get('/standards', { params });
    return response.data;
  } catch (error) {
    console.log('Can not search farmer: ', error);
  }
}

export async function deleteStandard(standardId: number) {
  try {
    const response = await api.delete(`/standards/${standardId}`);
    return response.data;
  } catch (error) {
    console.error('Can not get standard by id: ', error);
    throw error;
  }
}
