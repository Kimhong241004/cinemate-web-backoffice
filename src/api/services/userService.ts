import { apiClient } from '../clients/apiClient';

export interface UserFromApi {
  global_id: string;
  username: string;
  name: string;
  email: string;
  phone_number: string | null;
  profile_url: string | null;
  user_type: 'regular' | 'creator' | 'guest';
  follower_count: number;
  following_count: number;
  post_count: number;
  account_type?: 'guest' | 'registered';
  status: number; // 1 = active, 0 = suspended
  is_blocked: boolean;
  last_login: string | null;
  created_at: string;
}

export interface GetUsersResponse {
  data: UserFromApi[];
  meta: {
    total: number;
    page: number;
    take: number;
    total_pages: number;
  };
}

export interface GetUsersParams {
  page?: number;
  take?: number;
  search?: string;
  user_type?: 'regular' | 'creator';
}

export const userService = {
  // Omitting user_type returns all account types, including guests.
  getUsers: (params?: GetUsersParams) => {
    const query: Record<string, string> = {};
    if (params?.user_type) query.user_type = params.user_type;
    if (params?.page !== undefined) query.page = String(params.page);
    if (params?.take !== undefined) query.take = String(params.take);
    if (params?.search) query.search = params.search;
    return apiClient<GetUsersResponse>('/v1/users', { params: query });
  },

  updateStatus: (globalId: string, status: number) =>
    apiClient<UserFromApi>(`/v1/users/${globalId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  updateUserType: (globalId: string, user_type: string) =>
    apiClient<UserFromApi>(`/v1/users/${globalId}/user-type`, {
      method: 'POST',
      body: JSON.stringify({ user_type }),
    }),
};
