import api from '../../Axios';

export async function getAllMachineTypes() {
  try {
    const response = await api.get(`/machine-types`);
    return response.data;
  } catch (error) {
    console.error(`Can not get machine-types `, error);
    throw error;
  }
}

export async function getMachineById(id: number) {
  try {
    const response = await api.get(`/machine-types/${id}`);
    return response.data;
  } catch (error) {
    console.log('Can not get machine by id: ', error);
    throw error;
  }
}
