import { api } from './client';
import type { User } from './auth';

export interface UserList {
  total: number;
  items: User[];
}

export async function listUsers(limit = 50, offset = 0): Promise<UserList> {
  const { data } = await api.get<UserList>('/api/v1/users', { params: { limit, offset } });
  return data;
}

export async function updateUser(
  id: number,
  fields: Partial<Pick<User, 'role' | 'isActive' | 'displayName' | 'email' | 'service'>>
): Promise<User> {
  const { data } = await api.patch<User>(`/api/v1/users/${id}`, fields);
  return data;
}
