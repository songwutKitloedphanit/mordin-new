import { ServiceFertilizerMajorUsageInput } from '../../../types/fertilizer/ServiceFertilizerMajor';
import api from '../../Axios';

export async function updateFertilizerMajorUsages(
  data: ServiceFertilizerMajorUsageInput[]
) {
  try {
    const response = await api.patch('/service-fertilizer-major-usages', data);
    return response.data;
  } catch (error) {
    console.error('cannot update fertilizer major usages: ', error);
    throw error;
  }
}
