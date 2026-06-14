import { DepartmentInput } from '../../types/Department';
import { User, UserCreateInput, UserUpdateInput } from '../../types/User';
import api from '../Axios';

import { BaseResponse } from '@/types/response';

export async function getUserProfile() {
  const response = await api.get<BaseResponse<User>>('/auth/profile');

  return response.data;
}

export async function getUsers() {
  try {
    const response = await api.get('/users');
    console.log('getUsersFunction-userAPI', response);

    return response.data;
  } catch (error) {
    console.error('cannot get all users: ', error);
    throw error;
  }
}
export async function getUserById(id: number) {
  const res = await api.get(`/users/${id}`);
  return res.data as User; // backend ส่ง entity ตรง ๆ
}

export async function updateUser(id: number, data: Partial<UserUpdateInput>) {
  const res = await api.patch(`/users/${id}`, data);
  return res.data;
}
export async function createUser(data: UserCreateInput) {
  try {
    const response = await api.post('/users', data);
    return response.data;
  } catch (error) {
    console.log('Can not create user: ', error);
    throw error;
  }
}

export async function getAllDepartment() {
  try {
    const response = await api.get('/users/departments');
    return response.data;
  } catch (error) {
    console.error('Can not get all Department: ', error);
    throw error;
  }
}

export async function createDepartment(data: DepartmentInput) {
  try {
    const response = await api.post('/users/departments', data);
    return response.data;
  } catch (error) {
    console.error('Can not create Department: ', error);
    throw error;
  }
}

export async function deleteDepartment(id: number) {
  try {
    const response = await api.delete(`/users/departments/${id}`);
    return response.data;
  } catch (error) {
    console.error('Can not create Department: ', error);
    throw error;
  }
}

export async function getUserSummary() {
  try {
    const response = await api.get(`/users/summary`);
    return response.data;
  } catch (error) {
    console.error('Can not get all position: ', error);
    throw error;
  }
}

// export async function getAllPosition() {
//   try {
//     const response = await api.get(`/users/positions`);
//     return response.data;
//   } catch (error) {
//     console.error('Can not get all position: ', error);
//     throw error;
//   }
// }

// export async function createPosition(data: UserPositionCreateInput) {
//   try {
//     const response = await api.post(`/users/positions`, data);
//     return response.data;
//   } catch (error) {
//     console.error('Can not get all position: ', error);
//     throw error;
//   }
// }
