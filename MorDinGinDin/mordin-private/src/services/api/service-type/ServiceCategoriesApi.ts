import api from '../../Axios';

export async function deletServiceCategory(id: number) {
  try {
    const response = api.delete(`service-categories/${id}`);
    return response;
  } catch (error) {
    console.log('Can not delete service catagory', error);
  }
}

export async function getServiceCategoryById(id: number) {
  try {
    const response = await api.get(`/service-categories/${id}`);
    return response.data;
  } catch (error) {
    console.error('Cannot get service categories: ', error);
    throw error;
  }
}
