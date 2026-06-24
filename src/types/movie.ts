export interface MovieFormValues {
  title: string;
  releaseYear: string;
  genre: string[];
  language: string;
  quality: string;
  description: string;
  keywords: string[];
  accessType: ('buy' | 'membership' | 'free')[];
  freeEpisodeCount: string;
  uploadType: 'full' | 'series';
  price: string;
  episodePrice: string;
  authors: number[];
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

export interface Author {
  id: number;
  name: string;
  profile: string;
}

export interface Episode {
  id: number;
  episodeNumber: number;
  thumbnail: File | null;
  thumbnailPreview: string;
  platform: string;
  releaseDate: string;
  videoFile: File | null;
  videoPreview: string;
  uploadProgress: number;
}

export interface Season {
  id: number;
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
  initialPreviews?: { poster?: string; cover?: string };
  onCancel: () => void;
  onSubmit: (values: MovieFormValues, files: MovieFormFiles) => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}
