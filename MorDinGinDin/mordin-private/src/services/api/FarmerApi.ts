import { FarmerCreateInput, FarmerSearch } from '../../types/Farmer';
import api from '../Axios';

export async function getAllFarmers() {
  try {
    const response = await api.get('/farmers');
    return response.data;
  } catch (error) {
    console.log('Can not get all farmer: ', error);
    throw error;
  }
}

export async function searchFarmers(params: FarmerSearch) {
  try {
    const response = await api.get('/farmers', { params });
    return response.data;
  } catch (error) {
    console.log('Can not search farmer: ', error);
    throw error;
  }
}

export async function createFarmer(data: FarmerCreateInput) {
  try {
    const response = await api.post('/farmers', data);
    return response.data;
  } catch (error) {
    console.log('Can not create farmer: ', error);
    throw error;
  }
}

export async function deleteFarmer(id: number) {
  try {
    const response = await api.delete(`/farmers/${id}`);
    return response.data;
  } catch (error) {
    console.log('Can not delete farmer: ', error);
    throw error;
  }
}

export async function getFarmerById(id: number) {
  try {
    const response = await api.get(`/farmers/${id}`);
    return response.data;
  } catch (error) {
    console.log('Can not get farmer: ', error);
    throw error;
  }
}

export async function updateFarmerById(id: number, data: FarmerCreateInput) {
  try {
    const response = await api.patch(`/farmers/${id}`, data);
    return response.data;
  } catch (error) {
    console.log('Can not update farmer: ', error);
    throw error;
  }
}

export async function getFarmerSummary() {
  try {
    const response = await api.get(`/farmers/summary`);
    return response.data;
  } catch (error) {
    console.log('Can not get farmer: ', error);
    throw error;
  }
}
