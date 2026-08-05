import { api, setToken, clearToken } from './client';

export interface User {
  id: number;
  username: string;
  displayName: string | null;
  email: string | null;
  service: string | null;
  role: 'admin' | 'membre';
  isActive: boolean;
  lastLoginAt: string | null;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/api/v1/auth/login', { username, password });
  setToken(data.token);
  return data;
}

export async function fetchMe(): Promise<User> {
  const { data } = await api.get<User>('/api/v1/auth/me');
  return data;
}

export function logout() {
  clearToken();
}
