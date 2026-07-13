import { apiClient } from '../clients/apiClient';

export type RoomStatus = 'active' | 'inactive' | 'finished';

export interface RoomFromApi {
  global_id: string;
  room_name: string;
  description: string | null;
  current_participants: number;
  total_movie: number;
  is_active: boolean;
  host_id: number;
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
  search?: string;
  room_status?: RoomStatus;
}

export const roomService = {
  getRooms: ({ skip = 0, take = 10, search, room_status }: GetRoomsParams = {}) => {
    const params: Record<string, string> = {
      skip: String(skip),
      take: String(take),
    };
    if (search) params.search = search;
    if (room_status) params.room_status = room_status;
    return apiClient<GetRoomsResponse>('/v1/rooms', { params });
  },

  getRoom: (globalId: string) =>
    apiClient<RoomFromApi>(`/v1/rooms/${globalId}`),

  endRoom: (globalId: string) =>
    apiClient<RoomFromApi>(`/v1/rooms/${globalId}/end`, { method: 'POST' }),

  disableRoom: (globalId: string) =>
    apiClient<RoomFromApi>(`/v1/rooms/${globalId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 0 }),
    }),
};
