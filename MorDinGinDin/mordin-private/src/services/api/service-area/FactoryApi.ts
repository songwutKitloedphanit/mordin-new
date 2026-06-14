import api from '../../Axios';

import {
  FactoryCreateInterface,
  FactoryUpdateInterface,
} from '@/types/service-area/Factories';

export async function getAllFactories() {
  try {
    const response = await api.get('/factories');
    return response.data;
  } catch (error) {
    console.error('cannot get factories: ', error);
    throw error;
  }
}

export async function createFactory(factoryFormData: FactoryCreateInterface) {
  try {
    const response = await api.post('/factories', factoryFormData);
    return response.data;
  } catch (error) {
    console.error('Can not create factories: ', error);
    throw error;
  }
}

export async function getFactoryById(id: number) {
  try {
    const response = await api.get(`/factories/${id}`);
    return response.data;
  } catch (error) {
    console.error('Can not get factory by id: ', error);
    throw error;
  }
}

export async function updateFactoryById(
  factoryId: number,
  factoryFormData: FactoryUpdateInterface
) {
  try {
    const response = await api.patch(
      `/factories/${factoryId}`,
      factoryFormData
    );
    return response.data;
  } catch (error) {
    console.error('Can not update factory by id: ', error);
    throw error;
  }
}

export async function getFactorySummary() {
  try {
    const response = await api.get(`/factories/summary`);
    return response.data;
  } catch (error) {
    console.error('Can not get factory by id: ', error);
    throw error;
  }
}

export async function deleteFactoryById(id: number) {
  try {
    const response = await api.delete(`/factories/${id}`);
    return response.data;
  } catch (error) {
    console.error('Can not delete factory by id: ', error);
    throw error;
  }
}
