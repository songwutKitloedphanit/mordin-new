import api from '../../Axios';

export async function getAllDistricts() {
  try {
    const response = await api.get('/districts');
    return response.data;
  } catch (error) {
    console.log('Can not get all district');

    throw error;
  }
}

export async function getDistrictsByProvinceCode(provinceCode: number) {
  try {
    const response = await api.get(`/districts/by-province/${provinceCode}`);
    return response.data;
  } catch (error) {
    console.log('Can not get districts by province');
    throw error;
  }
}

export async function getDistrictByCode(districtCode: number) {
  try {
    const response = await api.get(`/districts/${districtCode}`);
    return response.data;
  } catch (error) {
    console.log('Can not get district by code');
    throw error;
  }
}
