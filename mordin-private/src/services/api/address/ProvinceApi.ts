import api from '../../Axios';

export async function getAllProvinces() {
  try {
    const response = await api.get('/provinces');
    return response.data;
  } catch (error) {
    console.log('Can not get all province');
    throw error;
  }
}

export async function getProvinceByCode(provinceCode: number) {
  try {
    const response = await api.get(`/provinces/${provinceCode}`);
    return response.data;
  } catch (error) {
    console.log('Can not get province by code');
    throw error;
  }
}

export async function getProvinceByGeographyId(geographyId: number) {
  try {
    const response = await api.get(`/provinces/by-geography/${geographyId}`);
    return response.data;
  } catch (error) {
    console.log('Can not get province by geographyId');
    throw error;
  }
}
