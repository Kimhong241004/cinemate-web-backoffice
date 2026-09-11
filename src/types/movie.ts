export interface MovieFormValues {
  title: string;
  releaseYear: string;
  genre: string[];
  language: string;
  country: string;
  quality: string;
  description: string;
  keywords: string[];
  accessType: ('buy' | 'membership' | 'free')[];
  uploadType: 'full' | 'series';
  price: string;
  episodePrice: string;
  authors: string[];
  status: 'draft' | 'publish' | 'unpublished';
}

export interface MovieFormFiles {
  poster: File | null;
  cover: File | null;
  trailer: File | null;
  video: File | null;
}

export interface MovieFormPreviews {
  poster: string;
  cover: string;
  trailer: string;
  video: string;
}

export interface MovieFormErrors {
  title: string;
  releaseYear: string;
  genre: string;
  language: string;
  country: string;
  quality: string;
  description: string;
  keywords: string;
  price: string;
  poster: string;
  cover: string;
}

export interface SliderImage {
  id: number;
  preview: string;
  file: File | null;
}

export interface Episode {
  id: number;
  /** Set only for an episode that already exists on the server (loaded on Edit) —
   * used to call the lock/unlock endpoint directly instead of guessing is_free. */
  globalId?: string;
  /** The server's current lock state for an existing episode; kept in sync with isFree. */
  isLocked?: boolean;
  episodeNumber: number;
  title: string;
  isFree: boolean;
  thumbnail: File | null;
  thumbnailPreview: string;
  platform: string;
  releaseDate: string;
  videoFile: File | null;
  videoPreview: string;
  uploadProgress: number;
  /** Transcode status of the uploaded video, polled after the chunked upload completes. */
  convertStatus?: string;
}

export interface Season {
  id: number;
  /** Set only for a season that already exists on the server (loaded on Edit) —
   * used to call the unlock-all-episodes endpoint keyed on the season's real global_id. */
  globalId?: string;
  seasonNumber: number;
  episodes: Episode[];
}

export interface MovieFormProps {
  title: string;
  subtitle: string;
  submitLabel: string;
  submittingLabel: string;
  isSubmitting: boolean;
  initialValues?: Partial<MovieFormValues>;
  initialPreviews?: { poster?: string; cover?: string; trailer?: string; video?: string };
  initialSeasons?: Season[];
  onCancel: () => void;
  onSubmit: (
    values: MovieFormValues,
    files: MovieFormFiles,
    seasons: Season[],
    updateEpisodeField: (seasonId: number, episodeId: number, field: keyof Episode, value: any) => void,
    sliders: SliderImage[]
  ) => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}
