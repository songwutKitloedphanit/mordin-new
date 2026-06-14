import api from '../Axios';

import { ShopInput } from '@/types/Shop';

export async function getAllShops() {
  try {
    const response = await api.get('/shops');
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function createShop(shopData: ShopInput | FormData) {
  try {
    const isFormData = shopData instanceof FormData;
    const config = isFormData
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    const response = await api.post('/shops', shopData, config);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function updateShop(id: number, shopData: ShopInput | FormData) {
  try {
    const isFormData = shopData instanceof FormData;
    const config = isFormData
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    const response = await api.patch(`/shops/${id}`, shopData, config);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getShopById(id: number) {
  try {
    const response = await api.get(`/shops/${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getShopSummary() {
  try {
    const response = await api.get('/shops/summary');
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function deleteShop(id: number) {
  try {
    const response = await api.delete(`/shops/${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
