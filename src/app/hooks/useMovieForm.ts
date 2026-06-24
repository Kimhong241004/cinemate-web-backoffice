import { useRef, useState } from 'react';
import { availableAuthors, defaultMovieFormErrors, defaultMovieFormValues, getYearOptions } from '../constants/movieForm';
import { Episode, MovieFormFiles, MovieFormValues, Season, SliderImage } from '../../types/movie';

interface UseMovieFormOptions {
  initialValues?: Partial<MovieFormValues>;
  initialPreviews?: { poster?: string; cover?: string };
  showToast: (message: string, type: 'success' | 'error') => void;
  onSubmit: (values: MovieFormValues, files: MovieFormFiles) => void;
}

export const useMovieForm = ({ initialValues, initialPreviews, showToast, onSubmit }: UseMovieFormOptions) => {
  const posterInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const trailerInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const sliderInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<MovieFormValues>(() => ({ ...defaultMovieFormValues, ...initialValues }));

  const [keywordInput, setKeywordInput] = useState('');
  const [authorSearch, setAuthorSearch] = useState('');
  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);

  const [files, setFiles] = useState<MovieFormFiles>({ poster: null, cover: null, trailer: null, video: null });

  const [previews, setPreviews] = useState({
    poster: initialPreviews?.poster ?? '',
    cover: initialPreviews?.cover ?? '',
    trailer: '',
    video: '',
  });

  const [seasons, setSeasons] = useState<Season[]>([]);
  const [sliders, setSliders] = useState<SliderImage[]>([]);
  const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false);

  const [formErrors, setFormErrors] = useState(defaultMovieFormErrors);

  const yearOptions = getYearOptions();

  const handleImageChange = (type: 'poster' | 'cover', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
      }
      setFiles({ ...files, [type]: file });
      const reader = new FileReader();
      reader.onloadend = () => setPreviews({ ...previews, [type]: reader.result as string });
      reader.readAsDataURL(file);
      setFormErrors({ ...formErrors, [type]: '' });
    }
  };

  const removePosterOrCover = (type: 'poster' | 'cover') => {
    setFiles({ ...files, [type]: null });
    setPreviews({ ...previews, [type]: '' });
  };

  const removeSlider = (sliderId: number) => {
    setSliders(prev => prev.filter(slider => slider.id !== sliderId));
  };

  const handleSliderFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setSliders(prev => [...prev, { id: Date.now(), file, preview: reader.result as string }]);
    };
    reader.readAsDataURL(file);
    if (sliderInputRef.current) sliderInputRef.current.value = '';
  };

  const handleVideoChange = (type: 'trailer' | 'video', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        showToast('Please select a video file', 'error');
        return;
      }
      setFiles({ ...files, [type]: file });
      setPreviews({ ...previews, [type]: URL.createObjectURL(file) });
      showToast(`${type === 'trailer' ? 'Trailer' : 'Video'} selected: ${file.name}`, 'success');
    }
  };

  const removeVideo = (type: 'trailer' | 'video') => {
    setFiles({ ...files, [type]: null });
    setPreviews({ ...previews, [type]: '' });
  };

  const handleAddKeyword = () => {
    const trimmed = keywordInput.trim();
    if (trimmed && !formData.keywords.includes(trimmed)) {
      setFormData({ ...formData, keywords: [...formData.keywords, trimmed] });
      setKeywordInput('');
      setFormErrors({ ...formErrors, keywords: '' });
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setFormData({ ...formData, keywords: formData.keywords.filter(k => k !== keyword) });
  };

  const handleKeywordKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const handleGenerateKeywords = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      showToast('Please enter title and description first', 'error');
      return;
    }
    setIsGeneratingKeywords(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const aiKeywords = [
        formData.title.toLowerCase().split(' ')[0],
        ...formData.genre.map(g => g.toLowerCase()),
        formData.language.toLowerCase(),
        'cinema',
        'movie',
        formData.releaseYear,
      ].filter(Boolean).slice(0, 8);
      const newKeywords = aiKeywords.filter(kw => !formData.keywords.includes(kw));
      if (newKeywords.length > 0) {
        setFormData({ ...formData, keywords: [...formData.keywords, ...newKeywords] });
        setFormErrors({ ...formErrors, keywords: '' });
        showToast(`Generated ${newKeywords.length} keywords successfully!`, 'success');
      } else {
        showToast('All keywords already added', 'success');
      }
    } catch {
      showToast('Failed to generate keywords', 'error');
    } finally {
      setIsGeneratingKeywords(false);
    }
  };

  const filteredAuthors = availableAuthors.filter(author =>
    author.name.toLowerCase().includes(authorSearch.toLowerCase())
  );

  const selectedAuthors = availableAuthors.filter(a => formData.authors.includes(a.id));

  const toggleGenre = (genre: string) => {
    if (formData.genre.includes(genre)) {
      setFormData({ ...formData, genre: formData.genre.filter(g => g !== genre) });
    } else {
      setFormData({ ...formData, genre: [...formData.genre, genre] });
    }
    setFormErrors({ ...formErrors, genre: '' });
  };

  const toggleAuthor = (authorId: number) => {
    if (formData.authors.includes(authorId)) {
      setFormData({ ...formData, authors: formData.authors.filter(id => id !== authorId) });
    } else {
      setFormData({ ...formData, authors: [...formData.authors, authorId] });
    }
  };

  const selectAuthor = (authorId: number) => {
    toggleAuthor(authorId);
    setAuthorSearch('');
    setShowAuthorDropdown(false);
  };

  const addSeason = () => {
    const newSeason: Season = { id: Date.now(), seasonNumber: seasons.length + 1, episodes: [] };
    setSeasons([...seasons, newSeason]);
  };

  const removeSeason = (seasonId: number) => {
    setSeasons(seasons.filter(s => s.id !== seasonId));
  };

  const addEpisode = (seasonId: number) => {
    setSeasons(seasons.map(season => {
      if (season.id === seasonId) {
        const newEpisode: Episode = {
          id: Date.now(), episodeNumber: season.episodes.length + 1,
          thumbnail: null, thumbnailPreview: '', platform: '', releaseDate: '',
          videoFile: null, videoPreview: '', uploadProgress: 0,
        };
        return { ...season, episodes: [...season.episodes, newEpisode] };
      }
      return season;
    }));
  };

  const removeEpisode = (seasonId: number, episodeId: number) => {
    setSeasons(seasons.map(season => {
      if (season.id === seasonId) {
        return { ...season, episodes: season.episodes.filter(e => e.id !== episodeId) };
      }
      return season;
    }));
  };

  const handleEpisodeThumbnailChange = (seasonId: number, episodeId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSeasons(seasons.map(season => {
          if (season.id === seasonId) {
            return {
              ...season,
              episodes: season.episodes.map(ep => ep.id === episodeId ? { ...ep, thumbnail: file, thumbnailPreview: reader.result as string } : ep),
            };
          }
          return season;
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEpisodeVideoChange = (seasonId: number, episodeId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        showToast('Please select a video file', 'error');
        return;
      }
      const videoURL = URL.createObjectURL(file);
      setSeasons(seasons.map(season => {
        if (season.id === seasonId) {
          return {
            ...season,
            episodes: season.episodes.map(ep => ep.id === episodeId ? { ...ep, videoFile: file, videoPreview: videoURL } : ep),
          };
        }
        return season;
      }));
      showToast('Video selected successfully', 'success');
    }
  };

  const updateEpisodeField = (seasonId: number, episodeId: number, field: keyof Episode, value: any) => {
    setSeasons(seasons.map(season => {
      if (season.id === seasonId) {
        return {
          ...season,
          episodes: season.episodes.map(ep => ep.id === episodeId ? { ...ep, [field]: value } : ep),
        };
      }
      return season;
    }));
  };

  const isFormValid = () => {
    if (!formData.title.trim()) return false;
    if (!formData.releaseYear.trim() || !/^\d{4}$/.test(formData.releaseYear)) return false;
    if (formData.genre.length === 0) return false;
    if (!formData.language) return false;
    if (!formData.quality) return false;
    if (!formData.description.trim()) return false;
    if (formData.keywords.length === 0) return false;
    if (!formData.price.trim() || isNaN(Number(formData.price)) || Number(formData.price) < 0) return false;
    if (!previews.poster) return false;
    if (!previews.cover) return false;
    return true;
  };

  const validateForm = () => {
    const errors = { ...defaultMovieFormErrors };
    let isValid = true;

    if (!formData.title.trim()) { errors.title = 'Movie title is required'; isValid = false; }

    if (!formData.releaseYear.trim()) {
      errors.releaseYear = 'Release year is required'; isValid = false;
    } else if (!/^\d{4}$/.test(formData.releaseYear)) {
      errors.releaseYear = 'Please enter a valid year (e.g., 2024)'; isValid = false;
    }

    if (formData.genre.length === 0) { errors.genre = 'Please select at least one genre'; isValid = false; }
    if (!formData.language) { errors.language = 'Language is required'; isValid = false; }
    if (!formData.quality) { errors.quality = 'Video quality is required'; isValid = false; }
    if (!formData.description.trim()) { errors.description = 'Description is required'; isValid = false; }
    if (formData.keywords.length === 0) { errors.keywords = 'At least one keyword is required for SEO'; isValid = false; }

    if (!formData.price.trim()) {
      errors.price = 'Price is required'; isValid = false;
    } else if (isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      errors.price = 'Please enter a valid price'; isValid = false;
    }

    if (!previews.poster) { errors.poster = 'Poster image is required'; isValid = false; }
    if (!previews.cover) { errors.cover = 'Cover image is required'; isValid = false; }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      showToast('Please fix all errors before submitting', 'error');
      return;
    }
    onSubmit(formData, files);
  };

  return {
    refs: { posterInputRef, coverInputRef, trailerInputRef, videoInputRef, sliderInputRef },
    formData, setFormData,
    keywordInput, setKeywordInput,
    authorSearch, setAuthorSearch,
    showAuthorDropdown, setShowAuthorDropdown,
    files, setFiles,
    previews, setPreviews,
    seasons,
    sliders,
    isGeneratingKeywords,
    formErrors,
    yearOptions,
    filteredAuthors,
    selectedAuthors,
    handleImageChange,
    removePosterOrCover,
    removeSlider,
    handleSliderFileChange,
    handleVideoChange,
    removeVideo,
    handleAddKeyword,
    handleRemoveKeyword,
    handleKeywordKeyPress,
    handleGenerateKeywords,
    toggleGenre,
    toggleAuthor,
    selectAuthor,
    addSeason,
    removeSeason,
    addEpisode,
    removeEpisode,
    handleEpisodeThumbnailChange,
    handleEpisodeVideoChange,
    updateEpisodeField,
    isFormValid,
    handleSubmit,
  };
};
