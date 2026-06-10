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

export async function getAllFactoriesManagement() {
  const response = await api.get('/factories/management');
  return response.data;
}

export async function createFactory(factoryFormData: FactoryCreateInterface) {
  try {
    const response = await api.post('/factories', sanitizeFactory(factoryFormData));
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

export async function getFactoryByIdManagement(id: number) {
  const response = await api.get(`/factories/management/${id}`);
  return response.data;
}

export async function updateFactoryById(
  factoryId: number,
  factoryFormData: FactoryUpdateInterface
) {
  try {
    const response = await api.patch(
      `/factories/${factoryId}`,
      sanitizeFactory(factoryFormData)
    );
    return response.data;
  } catch (error) {
    console.error('Can not update factory by id: ', error);
    throw error;
  }
}

function sanitizeFactory<T extends FactoryCreateInterface | FactoryUpdateInterface>(
  factory: T
) {
  const sanitizeAreas = (areas: import('@/types/service-area/ServiceAreas').ServiceAreaInputInterface[] = []) =>
    areas.map(
      ({
        clientKey: _clientKey,
        isActive: _isActive,
        isUsed: _isUsed,
        effectiveFrom: _effectiveFrom,
        effectiveTo: _effectiveTo,
        supersededByServiceAreaId: _supersededByServiceAreaId,
        ...area
      }) => area
    );
  return {
    ...factory,
    serviceAreas: sanitizeAreas(factory.serviceAreas),
    ...('newServiceAreas' in factory
      ? { newServiceAreas: sanitizeAreas(factory.newServiceAreas) }
      : {}),
  };
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
