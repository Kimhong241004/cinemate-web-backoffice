import { apiClient } from '../clients/apiClient';
import { UserFromApi, GetUsersResponse } from './userService';

export type { UserFromApi as CreatorFromApi };

export interface GetCreatorsParams {
  page?: number;
  take?: number;
  search?: string;
}

export const creatorService = {
  getCreators: (params?: GetCreatorsParams) => {
    const query: Record<string, string> = { user_type: 'creator' };
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

  updateUserType: (globalId: string, user_type: 'creator' | 'regular') =>
    apiClient<UserFromApi>(`/v1/users/${globalId}/user-type`, {
      method: 'POST',
      body: JSON.stringify({ user_type }),
    }),

  deleteCreator: (globalId: string) =>
    apiClient<void>(`/v1/users/${globalId}`, { method: 'DELETE' }),
};
