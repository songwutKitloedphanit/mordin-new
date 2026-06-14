import { BusInput } from '../../types/Bus';
import api from '../Axios';

export async function getAllBuses() {
  try {
    const response = await api.get('/buses');
    console.log('getAllBuses response: ', response.data);

    return response.data;
  } catch (error) {
    console.error('cannot get all buses: ', error);
    throw error;
  }
}

export async function createBus(busData: BusInput) {
  try {
    const response = await api.post('/buses', busData);
    return response.data;
  } catch (error) {
    console.error('cannot create bus: ', error);
    throw error;
  }
}

export async function updateBus(busId: number, busData: BusInput) {
  console.log('busData: ', busData);
  try {
    const response = await api.patch(`/buses/${busId}`, busData);
    return response.data;
  } catch (error) {
    console.error('cannot update bus: ', error);
    throw error;
  }
}

export async function getBusById(busId: number) {
  try {
    const response = await api.get(`/buses/${busId}`);
    return response.data;
  } catch (error) {
    console.error('cannot find bus: ', error);
    throw error;
  }
}

export async function deleteBus(busId: number) {
  try {
    const response = await api.delete(`/buses/${busId}`);
    return response.data;
  } catch (error) {
    console.error('cannot delete bus: ', error);
    throw error;
  }
}

export async function getBusSummary() {
  try {
    const response = await api.get(`/buses/summary`);
    return response.data;
  } catch (error) {
    console.error('cannot delete bus: ', error);
    throw error;
  }
}
