import api from '../../Axios';

export async function getAllGeoGraphies() {
  try {
    const response = await api.get('/geographies');
    return response.data;
  } catch (error) {
    console.log('Can not get all geographies');
    throw error;
  }
}
