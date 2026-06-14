import { LaboratoryInput } from '../../../types/Laboratory';
import api from '../../Axios';

export async function getLaboratoryById(id: number) {
  try {
    const response = await api.get(`/laboratories/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Can not get laboratory id: ${id}: `, error);
    throw error;
  }
}

export async function updateLaboratoryById(id: number, data: LaboratoryInput) {
  try {
    const response = await api.patch(`/laboratories/${id}`, data);
    return response;
  } catch (error) {
    console.error(`Can not update laboratory id: ${id}: `, error);
    throw error;
  }
}

export async function getAllLaboratories() {
  try {
    const response = await api.get('/laboratories');
    return response.data;
  } catch (error) {
    console.error('Can not get all laboratory: ', error);
    throw error;
  }
}

export async function createLaboratory(data: LaboratoryInput) {
  try {
    const response = await api.post('/laboratories', data);
    return response.data;
  } catch (error) {
    console.log('Can not create laboratory: ', error);
    throw error;
  }
}

export async function deleteLaboratory(id: number) {
  try {
    const response = await api.delete(`/laboratories/${id}`);
    return response.data;
  } catch (error) {
    console.log('Can not delete laboratory: ', error);
    throw error;
  }
}

export async function updateLaboratory(id: number, data: LaboratoryInput) {
  try {
    const response = await api.patch(`/laboratories/${id}`, data);
    return response.data;
  } catch (error) {
    console.log('Can not update laboratory: ', error);
    throw error;
  }
}
