import api from '../Axios';

import { AuthRequest, AuthResponse } from '@/types/Auth';

export async function login(payload: AuthRequest) {
  const response = await api.post<AuthResponse>('/auth/login', payload);

  return response.data;
}
