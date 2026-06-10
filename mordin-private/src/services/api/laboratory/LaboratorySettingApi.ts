import {
  LaboratorySettingDetailInput,
  LaboratorySettingInput,
} from '../../../types/laboratory/LaboratorySetting';
import api from '../../Axios';

export async function getAllLabSetting() {
  try {
    const response = await api.get(`/laboratory-settings`);
    return response.data;
  } catch (error) {
    console.error('Error can not get Lab Setting', error);
    throw error;
  }
}

export async function updateWorkingStandard(
  labSettingId: number,
  data: LaboratorySettingDetailInput[]
) {
  try {
    const response = await api.patch(
      `/laboratory-settings/${labSettingId}/working-standard`,
      data
    );
    return response.data;
  } catch (error) {
    console.error('Error updating working standard:', error);
    throw error;
  }
}

export async function getLabSettingById(id: number) {
  try {
    const response = await api.get(`/laboratory-settings/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error can not get Lab Setting', error);
    throw error;
  }
}

export async function updateLaboratorySetting(data: LaboratorySettingInput[]) {
  try {
    const response = await api.patch(`/laboratory-settings`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating laboratory setting:', error);
    throw error;
  }
}
