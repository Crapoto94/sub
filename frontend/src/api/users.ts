import { api } from './client';
import type { User } from './auth';

export interface UserList {
  total: number;
  items: User[];
}

export interface NewUser {
  username: string;
  displayName?: string;
  email?: string;
  service?: string;
  role?: 'admin' | 'membre';
  password?: string;
}

export async function listUsers(limit = 50, offset = 0): Promise<UserList> {
  const { data } = await api.get<UserList>('/api/v1/users', { params: { limit, offset } });
  return data;
}

export async function createUser(user: NewUser): Promise<User> {
  const { data } = await api.post<User>('/api/v1/users', user);
  return data;
}

export async function updateUser(
  id: number,
  fields: Partial<Pick<User, 'role' | 'isActive' | 'displayName' | 'email' | 'service'>>
): Promise<User> {
  const { data } = await api.patch<User>(`/api/v1/users/${id}`, fields);
  return data;
}

export async function resetPassword(id: number, password: string): Promise<User> {
  const { data } = await api.post<User>(`/api/v1/users/${id}/password`, { password });
  return data;
}
