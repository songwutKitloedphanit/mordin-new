import api from '../Axios';

import { ShopInput } from '@/types/Shop';

export async function getAllShops() {
  const response = await api.get('/shops');
  return response.data;
}

export async function createShop(shopData: ShopInput | FormData) {
  const isFormData = shopData instanceof FormData;
  const config = isFormData
    ? { headers: { 'Content-Type': 'multipart/form-data' } }
    : {};
  const response = await api.post('/shops', shopData, config);
  return response.data;
}

export async function updateShop(id: number, shopData: ShopInput | FormData) {
  const isFormData = shopData instanceof FormData;
  const config = isFormData
    ? { headers: { 'Content-Type': 'multipart/form-data' } }
    : {};
  const response = await api.patch(`/shops/${id}`, shopData, config);
  return response.data;
}

export async function getShopById(id: number) {
  const response = await api.get(`/shops/${id}`);
  return response.data;
}

export async function getShopSummary() {
  const response = await api.get('/shops/summary');
  return response.data;
}

export async function deleteShop(id: number) {
  const response = await api.delete(`/shops/${id}`);
  return response.data;
}
