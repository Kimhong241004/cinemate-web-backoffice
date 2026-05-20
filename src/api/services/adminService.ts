import { apiClient } from '../clients/apiClient';

export interface AdminFromApi {
  id: number;
  global_id: string;
  username: string;
  email: string;
  password?: string;
  profile_url: string | null;
  last_login: string;
  total_logins: number;
  status: number; // 0 = inactive, 1 = active
  created_at: string;
  updated_at: string;
}

export interface GetAdminsResponse {
  data: AdminFromApi[];
  total: number;
  take: number;
  skip: number;
}

export interface CreateAdminPayload {
  username: string;
  email: string;
  password: string;
  profile_url?: string;
  status?: number;
}

export interface UpdateAdminPayload {
  username?: string;
  email?: string;
  password?: string;
  profile_url?: string;
  status?: number;
}

export const adminService = {
  getAdmins: (skip = 0, take = 10) =>
    apiClient<GetAdminsResponse>('/v1/admins', {
      params: { skip: String(skip), take: String(take) },
    }),

  createAdmin: (payload: CreateAdminPayload) =>
    apiClient<AdminFromApi>('/v1/admins', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateAdmin: (globalId: string, payload: UpdateAdminPayload) =>
    apiClient<AdminFromApi>(`/v1/admins/${globalId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  deleteAdmin: (globalId: string) =>
    apiClient<void>(`/v1/admins/${globalId}`, {
      method: 'DELETE',
    }),
};
