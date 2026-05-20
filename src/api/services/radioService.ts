import { apiClient } from "../clients/apiClient";

export interface RadioChannelFromApi {
  id: number;
  global_id: string;
  name: string;
  genre: string;
  frequency: string;
  stream_url: string;
  logo_url: string | null;
  isDefault: boolean;
  total_views: number;
  status: number;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
}

export interface GetRadioChannelsResponse {
  total: number;
  data: RadioChannelFromApi[];
}

export interface GetRadioChannelsParams {
  skip?: number;
  take?: number;
  search?: string;
  status?: number;
}

export interface CreateRadioChannelData {
  name: string;
  genre: string;
  frequency: string;
  stream_url: string;
  logo_url?: string;
  isDefault: boolean;
  status: number;
}

export interface UpdateRadioChannelData extends Partial<CreateRadioChannelData> {}

export const radioService = {
  getRadioChannels: (params?: GetRadioChannelsParams) => {
    const query: Record<string, string> = {};
    if (params?.skip !== undefined) query.skip = String(params.skip);
    if (params?.take !== undefined) query.take = String(params.take);
    if (params?.search) query.search = params.search;
    if (params?.status !== undefined) query.status = String(params.status);
    return apiClient<GetRadioChannelsResponse>("/v1/radio-channels", {
      params: query,
    });
  },

  getRadioChannel: (globalId: string) => {
    return apiClient<RadioChannelFromApi>(`/v1/radio-channels/${globalId}`);
  },

  createRadioChannel: (data: CreateRadioChannelData) =>
    apiClient<RadioChannelFromApi>("/v1/radio-channels", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateRadioChannel: (globalId: string, data: UpdateRadioChannelData) =>
    apiClient<RadioChannelFromApi>(`/v1/radio-channels/${globalId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteRadioChannel: (globalId: string) => {
    return apiClient<void>(`/v1/radio-channels/${globalId}`, {
      method: "DELETE",
    });
  },
};
