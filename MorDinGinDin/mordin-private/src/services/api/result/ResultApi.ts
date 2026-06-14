import api from '@/services/Axios';

export async function inputResult(
  input: { resultId: number | null; preValue: number | null }[]
) {
  try {
    const response = await api.patch('/results/input', input);
    return response.data;
  } catch (error) {
    console.error('Cannot input result: ', error);
    throw error;
  }
}
export async function uploadCsvFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/results/upload/csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
}
