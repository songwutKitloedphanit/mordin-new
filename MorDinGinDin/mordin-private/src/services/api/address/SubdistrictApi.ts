import api from '../../Axios';

export async function getAllSubdistricts() {
  try {
    const response = await api.get('/subdistricts');
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getSubdistrictsByDistrictCode(districtCode: number) {
  try {
    const response = await api.get(`/subdistricts/by-district/${districtCode}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getSubcistrictByZipCode(zipCode: number) {
  try {
    const response = await api.get(`/subdistricts/by-zipCode/${zipCode}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
