import { apiClient } from '../clients/apiClient';

export type RoomStatus = 'active' | 'inactive' | 'deleted';

export interface RoomHost {
  id: number;
  username: string;
  name: string;
  phone_number: string | null;
}

export interface RoomFromApi {
  global_id: string;
  room_name: string;
  description: string | null;
  current_participants: number;
  total_movie: number;
  is_active: boolean;
  host: RoomHost;
  host_connected: boolean;
  host_last_active: string | null;
  room_status: RoomStatus;
  status: number; // 1 = active, 0 = disabled
  created_at: string;
  updated_at: string;
}

export interface GetRoomsResponse {
  data: RoomFromApi[];
  total: number;
  skip: number;
  take: number;
}

export interface GetRoomsParams {
  skip?: number;
  take?: number;
  room_status?: RoomStatus;
}

export interface RoomMovieGenre {
  global_id: string;
  name: string;
  slug: string;
}

export interface RoomMovie {
  global_id: string;
  content_type: string;
  title: string;
  description: string | null;
  base_price: number;
  video_quality: string;
  duration: string | null;
  poster_url: string | null;
  cover_url: string | null;
  genre: RoomMovieGenre;
}

export interface RoomParticipantUser {
  global_id: string;
  username: string;
  name: string;
  email: string;
  phone_number: string | null;
  access_type: string;
  profile_url: string | null;
}

export interface RoomParticipant {
  global_id: string;
  user_id: number;
  user: RoomParticipantUser;
  status: number;
  joined_at: string;
}

export interface RoomDetail extends RoomFromApi {
  movies: RoomMovie[];
  participants: RoomParticipant[];
}

export const roomService = {
  getRooms: ({ skip = 0, take = 10, room_status }: GetRoomsParams = {}) => {
    const params: Record<string, string> = {
      skip: String(skip),
      take: String(take),
    };
    if (room_status) params.room_status = room_status;
    return apiClient<GetRoomsResponse>('/v1/rooms', { params });
  },

  getRoom: (globalId: string) =>
    apiClient<RoomDetail>(`/v1/rooms/${globalId}`),

  endRoom: (globalId: string) =>
    apiClient<RoomFromApi>(`/v1/rooms/${globalId}/end`, { method: 'POST' }),

  disableRoom: (globalId: string) =>
    apiClient<RoomFromApi>(`/v1/rooms/${globalId}/deactivate`, {
      method: 'PATCH',
    }),

  activateRoom: (globalId: string) =>
    apiClient<RoomFromApi>(`/v1/rooms/${globalId}/activate`, {
      method: 'PATCH',
    }),
};
