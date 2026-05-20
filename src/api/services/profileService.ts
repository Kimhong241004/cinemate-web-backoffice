import { apiClient } from '../clients/apiClient';

export interface Profile {
  global_id: string;
  username: string;
  email: string;
  profile_url: string | null;
  last_login: string;
}

export interface UpdateProfilePayload {
  username?: string;
  email?: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  confirm_new_password: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export const profileService = {
  getProfile: () => apiClient<Profile>('/v1/profile'),

  updateProfile: (payload: UpdateProfilePayload) =>
    apiClient<Profile>('/v1/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return apiClient<Profile>('/v1/profile/avatar', { method: 'POST', body: form });
  },

  changePassword: (payload: ChangePasswordPayload) =>
    apiClient<ChangePasswordResponse>('/v1/profile/password', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
};
