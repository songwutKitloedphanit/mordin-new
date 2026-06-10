import api from '@/services/Axios';
import { ConvertOmSettingInput } from '@/types/laboratory/ConvertOmSetting';

export async function updateConvertOmSetting(
  id: number,
  data: ConvertOmSettingInput
) {
  try {
    const response = await api.patch(`convert-om-settings/${id}`, data);
    return response.data;
  } catch (error) {
    console.log('Can not update Convert OM Setting', error);
    throw error;
  }
}
