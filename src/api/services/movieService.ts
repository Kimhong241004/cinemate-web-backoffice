import { apiClient } from '../clients/apiClient';

export interface GenreFromApi {
  id: number;
  global_id: string;
  name: string;
  slug: string;
  status?: number;
  created_at?: string;
  updated_at?: string;
}

export interface GetGenresResponse {
  total: number;
  skip: number;
  take: number;
  data: GenreFromApi[];
}

export interface MovieAuthor {
  id?: number;
  global_id: string;
  name: string;
  profile_url: string | null;
}

export interface MovieSource {
  id: number;
  global_id: string;
  movie_url: string;
  upload_status: string;
  created_at: string;
}

export interface MovieEpisode {
  id: number;
  global_id: string;
  episode_number: number;
  title: string;
  duration: number | null;
  release_date: string;
}

export interface MovieSeason {
  id: number;
  season_number: number;
  episodes: MovieEpisode[];
}

export interface MovieFromApi {
  id: number;
  global_id: string;
  content_type: 'movie' | 'series';
  title: string;
  description: string;
  release_date: string;
  base_price: number;
  language: string;
  country: string;
  video_quality: 'hd' | 'full_hd' | 'four_k' | string;
  movie_type: string;
  keywords: string;
  duration: number | null;
  trailer_url: string | null;
  trailer_convert_status: string | null;
  poster_url: string | null;
  cover_url: string | null;
  movie_status: 'draft' | 'published' | 'unpublished';
  is_highlight: boolean;
  total_revenue: number;
  total_views: number;
  total_likes: number;
  total_comments: number;
  total_saves: number;
  total_shares: number;
  status: number;
  created_at: string;
  updated_at: string;
  movie_authors: MovieAuthor[];
  genres: GenreFromApi[];
  sources?: MovieSource[];
  seasons?: MovieSeason[];
}

export interface GetMoviesResponse {
  total: number;
  skip: number;
  take: number;
  data: MovieFromApi[];
}

export interface GetMoviesParams {
  skip?: number;
  take?: number;
  search?: string;
  status?: number;
  movie_status?: 'draft' | 'published' | 'unpublished';
  content_type?: 'movie' | 'series';
  genre?: string;
}

export interface CreateMovieData {
  content_type: 'movie' | 'series';
  title: string;
  description: string;
  release_date: string;
  base_price: number;
  language: string;
  country: string;
  video_quality: string;
  movie_type: string;
  keywords: string;
  duration?: number;
  movie_status: 'draft' | 'published' | 'unpublished';
  status: number;
  author_ids: string[];
  genre_ids: string[];
  seasons?: {
    season_number: number;
    episodes: {
      episode_number: number;
      title: string;
      duration: number;
      release_date: string;
    }[];
  }[];
}

export interface UpdateMovieData extends Partial<CreateMovieData> {
  is_highlight?: boolean;
}

export interface UploadMovieFilesData {
  poster_file?: File;
  cover_file?: File;
  trailer_file?: File;
  movie_file?: File;
  episode_file?: File;
  episode_global_id?: string;
}

export const movieService = {
  getMovies: (params?: GetMoviesParams) => {
    const query: Record<string, string> = {};
    if (params?.skip !== undefined) query.skip = String(params.skip);
    if (params?.take !== undefined) query.take = String(params.take);
    if (params?.search) query.search = params.search;
    if (params?.status !== undefined) query.status = String(params.status);
    if (params?.movie_status) query.movie_status = params.movie_status;
    if (params?.content_type) query.content_type = params.content_type;
    if (params?.genre) query.genre = params.genre;
    return apiClient<GetMoviesResponse>('/v1/movies', { params: query });
  },

  getMovie: (globalId: string) => {
    return apiClient<MovieFromApi>(`/v1/movies/${globalId}`);
  },

  createMovie: (data: CreateMovieData) => {
    return apiClient<MovieFromApi>('/v1/movies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateMovie: (globalId: string, data: UpdateMovieData) => {
    return apiClient<MovieFromApi>(`/v1/movies/${globalId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteMovie: (globalId: string) => {
    return apiClient<void>(`/v1/movies/${globalId}`, { method: 'DELETE' });
  },

  uploadFiles: (globalId: string, data: UploadMovieFilesData) => {
    const form = new FormData();
    if (data.poster_file) form.append('poster_file', data.poster_file);
    if (data.cover_file) form.append('cover_file', data.cover_file);
    if (data.trailer_file) form.append('trailer_file', data.trailer_file);
    if (data.movie_file) form.append('movie_file', data.movie_file);
    if (data.episode_file) form.append('episode_file', data.episode_file);
    if (data.episode_global_id) form.append('episode_global_id', data.episode_global_id);
    return apiClient<MovieFromApi>(`/v1/movies/${globalId}/upload`, {
      method: 'POST',
      body: form,
    });
  },

  getGenres: (params?: { skip?: number; take?: number }) => {
    const query: Record<string, string> = {};
    if (params?.skip !== undefined) query.skip = String(params.skip);
    if (params?.take !== undefined) query.take = String(params.take);
    return apiClient<GetGenresResponse>('/v1/genres', { params: query });
  },
};
