import { MovieFormErrors, MovieFormValues } from '../../types/movie';

export const defaultMovieFormValues: MovieFormValues = {
  title: '',
  releaseYear: '',
  genre: [],
  language: '',
  quality: '',
  description: '',
  keywords: [],
  accessType: [],
  uploadType: 'full',
  price: '',
  episodePrice: '',
  authors: [],
  status: 'draft',
};

export const defaultMovieFormErrors: MovieFormErrors = {
  title: '', releaseYear: '', genre: '', language: '', quality: '',
  description: '', keywords: '', price: '', poster: '', cover: '',
};

export const languageOptions = ['Khmer', 'English', 'Chinese', 'Korean', 'Thai', 'Japanese', 'Hindi'];
export const qualityOptions = ['FHD', 'HD', 'SD'];

export const getYearOptions = (): number[] => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i);
};
