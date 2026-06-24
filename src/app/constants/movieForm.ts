import { Author, MovieFormErrors, MovieFormValues } from '../../types/movie';

export const defaultMovieFormValues: MovieFormValues = {
  title: '',
  releaseYear: '',
  genre: [],
  language: '',
  quality: '',
  description: '',
  keywords: [],
  accessType: [],
  freeEpisodeCount: '',
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

export const genreOptions = ['Action', 'Drama', 'Comedy', 'Romance', 'Horror', 'Thriller', 'China', 'Korea', 'Thai', 'Fantasy', 'Sci-Fi', 'Adventure'];
export const languageOptions = ['Khmer', 'English', 'Chinese', 'Korean', 'Thai', 'Japanese', 'Hindi'];
export const qualityOptions = ['FHD', 'HD', 'SD'];

export const getYearOptions = (): number[] => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i);
};

// Mock authors data - Replace with actual API call
export const availableAuthors: Author[] = [
  { id: 1, name: 'Sopheak Creators', profile: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
  { id: 2, name: 'Dara Entertainment', profile: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
  { id: 3, name: 'Veasna Films', profile: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' },
  { id: 4, name: 'Chan Rithy', profile: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop' },
  { id: 5, name: 'Srey Leak', profile: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop' },
  { id: 6, name: 'Pich Chanboramey', profile: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop' },
];
