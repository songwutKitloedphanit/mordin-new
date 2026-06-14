import api from '../Axios';

import { LandInputInterface } from '@/types/Land';

export async function getAllLands() {
  try {
    const response = await api.get('/lands');
    return response.data;
  } catch (error) {
    console.log('Can not get lands', error);
    throw error;
  }
}

export async function createLand(data: LandInputInterface) {
  try {
    const response = await api.post('/lands', data);
    return response;
  } catch (error) {
    console.log('Can not create lands', error);
    throw error;
  }
}

export async function getLandById(id: number) {
  try {
    const response = await api.get(`/lands/${id}`);
    return response.data;
  } catch (error) {
    console.log('Can not get land', error);
    throw error;
  }
}

export async function updateLandById(id: number, data: LandInputInterface) {
  try {
    const response = await api.patch(`/lands/${id}`, data);
    return response;
  } catch (error) {
    console.log('Can not get land', error);
    throw error;
  }
}

export async function getLandSummary() {
  try {
    const response = await api.get(`/lands/summary`);
    return response.data;
  } catch (error) {
    console.log('Can not get land', error);
    throw error;
  }
}
export async function deleteLandById(id: number) {
  try {
    const response = await api.delete(`/lands/${id}`);
    return response.data;
  } catch (error) {
    console.log('Can not delete land', error);
    throw error;
  }
}
