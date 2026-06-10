import api from '../../Axios';

import { Unit } from '@/types/reference-data/Units';

export async function getAllUnits() {
  try {
    const response = await api.get('/units');
    return response.data;
  } catch (error) {
    console.error('Cannot get units: ', error);
    throw error;
  }
}

export async function createUnit(unitFormData: Unit) {
  try {
    const response = await api.post('/units', unitFormData);
    return response.data;
  } catch (error) {
    console.error('Cannot create unit: ', error);
    throw error;
  }
}

export async function getUnitById(id: number) {
  try {
    const response = await api.get(`/units/${id}`);
    return response.data;
  } catch (error) {
    console.error('Cannot get unit by id: ', error);
    throw error;
  }
}

export async function updateUnit(id: number, unitFormData: Unit) {
  try {
    const response = await api.patch(`/units/${id}`, unitFormData);
    return response.data;
  } catch (error) {
    console.error('Cannot update unit: ', error);
    throw error;
  }
}

export async function deleteUnit(id: number) {
  try {
    const response = await api.delete(`/units/${id}`);
    return response.data;
  } catch (error) {
    console.error('Cannot delete unit: ', error);
    throw error;
  }
}
