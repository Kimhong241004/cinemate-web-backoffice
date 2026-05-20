import { apiClient } from '../clients/apiClient';

export interface AuthorFromApi {
  id: number;
  global_id: string;
  name: string;
  profile_url: string;
  movie_total: number;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface GetAuthorsResponse {
  total: number;
  skip: number;
  take: number;
  data: AuthorFromApi[];
}

export interface GetAuthorsParams {
  skip?: number;
  take?: number;
  search?: string;
  status?: number;
}

export const authorService = {
  getAuthors: (params?: GetAuthorsParams) => {
    const query: Record<string, string> = {};
    if (params?.skip !== undefined) query.skip = String(params.skip);
    if (params?.take !== undefined) query.take = String(params.take);
    if (params?.search) query.search = params.search;
    if (params?.status !== undefined) query.status = String(params.status);
    return apiClient<GetAuthorsResponse>('/v1/authors', { params: query });
  },

  createAuthor: (data: { name: string; profile_file?: File; profile_url?: string; status: number }) => {
    const form = new FormData();
    form.append('name', data.name);
    form.append('status', String(data.status));
    if (data.profile_file) form.append('profile_image', data.profile_file);
    else if (data.profile_url) form.append('profile_url', data.profile_url);
    return apiClient<AuthorFromApi>('/v1/authors', { method: 'POST', body: form });
  },

  updateAuthor: (globalId: string, data: { name: string; profile_file?: File; profile_url?: string; status: number }) => {
    const form = new FormData();
    form.append('name', data.name);
    form.append('status', String(data.status));
    if (data.profile_file) form.append('profile_image', data.profile_file);
    else if (data.profile_url) form.append('profile_url', data.profile_url);
    return apiClient<AuthorFromApi>(`/v1/authors/${globalId}`, { method: 'PATCH', body: form });
  },

  deleteAuthor: (globalId: string) =>
    apiClient<void>(`/v1/authors/${globalId}`, { method: 'DELETE' }),
};
