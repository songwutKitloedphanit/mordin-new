import {
  ServiceTypeInput,
  ServiceTypeSummary,
} from '../../../types/service-type/ServiceTypes';
import api from '../../Axios';

export async function getAllServiceTypes() {
  try {
    const response = await api.get('/service-types');
    console.log('Service types: ', response.data);

    return response.data;
  } catch (error) {
    console.error('Cannot get service types: ', error);
    throw error;
  }
}

export async function getAllServiceTypesWithFertilizerUsages() {
  try {
    const response = await api.get('/service-types/fertilizer-usages');
    return response.data;
  } catch (error) {
    console.error('Cannot get service types with fertilizer usages: ', error);
    throw error;
  }
}

export async function createServiceType(serviceTypeFormData: ServiceTypeInput) {
  try {
    const response = await api.post('/service-types', serviceTypeFormData);
    return response.data;
  } catch (error) {
    console.error('Cannot create service type: ', error);
    throw error;
  }
}

export async function getServiceTypeById(id: number) {
  try {
    const response = await api.get(`/service-types/${id}`);
    return response.data;
  } catch (error) {
    console.error('Cannot get service type by id: ', error);
    throw error;
  }
}

export async function getServiceTypeWithFertilizerUsagesById(id: number) {
  try {
    const response = await api.get(`/service-types/fertilizer-usages/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      'Cannot get service type with fertilizer usages by id: ',
      error
    );
    throw error;
  }
}

export async function getServiceTypeForSoilGradeEdit(id: number) {
  try {
    const response = await api.get(`/service-types/fertilizer-usages/soil-grade/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      'Cannot get service type for soil grade edit: ',
      error
    );
    throw error;
  }
}

export async function updateServiceType(
  id: number,
  serviceTypeFormData: ServiceTypeInput
) {
  try {
    const response = await api.patch(
      `/service-types/${id}`,
      serviceTypeFormData
    );
    return response.data;
  } catch (error) {
    console.error('Cannot update service type: ', error);
    throw error;
  }
}

export async function deleteServiceType(id: number) {
  try {
    const response = await api.delete(`/service-types/${id}`);
    return response.data;
  } catch (error) {
    console.error('Cannot delete service type: ', error);
    throw error;
  }
}

export async function getServiceTypeSummary(): Promise<ServiceTypeSummary> {
  try {
    const response = await api.get('/service-types/summary');
    return response.data;
  } catch (error) {
    console.error('Cannot get service type summary:', error);
    throw error;
  }
}
