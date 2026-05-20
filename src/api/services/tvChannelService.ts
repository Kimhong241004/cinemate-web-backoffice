import { apiClient } from '../clients/apiClient';

export interface TvChannelFromApi {
  id: number;
  global_id: string;
  name: string;
  description: string | null;
  category: string | null;
  tv_type: string | null;
  logo_url: string | null;
  stream_url: string;
  status: number;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
}

export interface GetTvChannelsResponse {
  total: number;
  data: TvChannelFromApi[];
}

export interface GetTvChannelsParams {
  skip?: number;
  take?: number;
  search?: string;
  status?: number;
}

export interface CreateTvChannelData {
  name: string;
  description?: string;
  category?: string;
  tv_type?: string;
  logo_url?: string;
  stream_url: string;
  status: number;
}

export interface UpdateTvChannelData {
  name?: string;
  description?: string;
  category?: string;
  tv_type?: string;
  logo_url?: string;
  stream_url?: string;
  status?: number;
}

export const tvChannelService = {
  getTvChannels: (params?: GetTvChannelsParams) => {
    const query: Record<string, string> = {};
    if (params?.skip !== undefined) query.skip = String(params.skip);
    if (params?.take !== undefined) query.take = String(params.take);
    if (params?.search) query.search = params.search;
    if (params?.status !== undefined) query.status = String(params.status);
    return apiClient<GetTvChannelsResponse>('/v1/tv-channels', { params: query });
  },

  createTvChannel: (data: CreateTvChannelData) =>
    apiClient<TvChannelFromApi>('/v1/tv-channels', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTvChannel: (globalId: string, data: UpdateTvChannelData) =>
    apiClient<TvChannelFromApi>(`/v1/tv-channels/${globalId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteTvChannel: (globalId: string) => {
    return apiClient<void>(`/v1/tv-channels/${globalId}`, {
      method: 'DELETE',
    });
  },
};