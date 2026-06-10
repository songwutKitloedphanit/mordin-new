import { SampleBlankInput } from '../../../types/sample-blank/sampleBlank';
import api from '../../Axios';

export async function getAllSampleBlanks() {
  try {
    const response = await api.get('/sample-blanks');
    return response.data;
  } catch (error) {
    console.error('Cannot get sample blanks: ', error);
    throw error;
  }
}

export async function createSampleBlank(SampleBlankFormData: SampleBlankInput) {
  try {
    const response = await api.post('/sample-blanks', SampleBlankFormData);
    return response.data;
  } catch (error) {
    console.error('Cannot create sample blank: ', error);
    throw error;
  }
}

export async function getSampleBlankById(id: number) {
  try {
    const response = await api.get(`/sample-blanks/${id}`);
    return response.data;
  } catch (error) {
    console.error('Cannot get sample blank by id: ', error);
    throw error;
  }
}

export async function updateSampleBlank(
  id: number,
  SampleBlankFormData: SampleBlankInput
) {
  try {
    const response = await api.patch(
      `/sample-blanks/${id}`,
      SampleBlankFormData
    );
    return response.data;
  } catch (error) {
    console.error('Cannot update sample blank: ', error);
    throw error;
  }
}

export async function deleteSampleBlank(id: number) {
  try {
    const response = await api.delete(`/sample-blanks/${id}`);
    return response.data;
  } catch (error) {
    console.error('Cannot delete sample blank: ', error);
    throw error;
  }
}
