import {
  ServiceAreaInputInterface,
  SupersedeServiceAreaInput,
} from '../../../types/service-area/ServiceAreas';
import api from '../../Axios';

export async function getAllServiceAreas() {
  try {
    const response = await api.get('/service-areas');
    return response.data;
  } catch (error) {
    console.error('cannot get all service areas: ', error);
    throw error;
  }
}

export async function createServiceAreas(
  serviceAreasData: ServiceAreaInputInterface[] | ServiceAreaInputInterface
) {
  try {
    const response = await api.post('/service-areas', serviceAreasData);
    return response.data;
  } catch (error) {
    console.error('cannot add service areas: ', error);
    throw error;
  }
}

export async function getServiceAreaById(id: number) {
  try {
    const response = await api.get(`/service-areas/${id}`);
    return response.data;
  } catch (error) {
    console.error('cannot get service area by id: ', error);
    throw error;
  }
}

export async function deleteServiceAreaById(id: number) {
  try {
    const response = await api.delete(`/service-areas/${id}`);
    return response.data;
  } catch (error) {
    console.error('cannot delete service area by id: ', error);
    throw error;
  }
}

export async function moveServiceAreaById(id: number, targetFactoryId: number) {
  try {
    const response = await api.patch(`/service-areas/${id}/move`, {
      targetFactoryId,
    });
    return response.data;
  } catch (error) {
    console.error('cannot move service area: ', error);
    throw error;
  }
}

export async function supersedeServiceAreaById(
  id: number,
  payload: SupersedeServiceAreaInput
) {
  try {
    const response = await api.post(`/service-areas/${id}/supersede`, payload);
    return response.data;
  } catch (error) {
    console.error('cannot supersede service area: ', error);
    throw error;
  }
}
