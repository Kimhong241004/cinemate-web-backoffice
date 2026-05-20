import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Upload, X, Check, Film, Search, Play, Plus, Sparkles } from 'lucide-react';

interface Author {
  id: number;
  name: string;
  profile: string;
}

interface Episode {
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

interface Season {
  id: number;
  seasonNumber: number;
  episodes: Episode[];
}

const AddMovie = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const posterInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const trailerInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    releaseYear: '',
    genre: [] as string[],
    language: '',
    quality: '',
    description: '',
    keywords: [] as string[],
    movieType: '',
    uploadType: 'full' as 'full' | 'series',
    price: '',
    authors: [] as number[],
    status: 'draft' as 'draft' | 'publish' | 'unpublished',
  });

  const [keywordInput, setKeywordInput] = useState('');
  const [authorSearch, setAuthorSearch] = useState('');
  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);

  const [files, setFiles] = useState({
    poster: null as File | null,
    cover: null as File | null,
    trailer: null as File | null,
    video: null as File | null,
  });

  const [previews, setPreviews] = useState({
    poster: '',
    cover: '',
    trailer: '',
    video: '',
  });

  const [uploadProgress, setUploadProgress] = useState({
    trailer: 0,
    video: 0,
  });

  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false);

  const [formErrors, setFormErrors] = useState({
    title: '',
    releaseYear: '',
    genre: '',
    language: '',
    quality: '',
    description: '',
    keywords: '',
    movieType: '',
    price: '',
    poster: '',
    cover: '',
  });

  // Mock authors data - Replace with actual API call
  const availableAuthors: Author[] = [
    { id: 1, name: 'Sopheak Creators', profile: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
    { id: 2, name: 'Dara Entertainment', profile: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
    { id: 3, name: 'Veasna Films', profile: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' },
    { id: 4, name: 'Chan Rithy', profile: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop' },
    { id: 5, name: 'Srey Leak', profile: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop' },
    { id: 6, name: 'Pich Chanboramey', profile: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop' },
  ];

  // Generate years from 1950 to current year
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i);

  const genreOptions = ['Action', 'Drama', 'Comedy', 'Romance', 'Horror', 'Thriller', 'China', 'Korea', 'Thai', 'Fantasy', 'Sci-Fi', 'Adventure'];
  const languageOptions = ['Khmer', 'English', 'Chinese', 'Korean', 'Thai', 'Japanese', 'Hindi'];
  const qualityOptions = ['FHD', 'HD', 'SD'];
  const movieTypeOptions = ['Full Movie', 'Drama', 'Short'];

  // Show toast
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Handle image file selection
  const handleImageChange = (type: 'poster' | 'cover', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
      }

      setFiles({ ...files, [type]: file });

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews({ ...previews, [type]: reader.result as string });
      };
      reader.readAsDataURL(file);

      // Clear error
      setFormErrors({ ...formErrors, [type]: '' });
    }
  };

  // Handle video file selection
  const handleVideoChange = (type: 'trailer' | 'video', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        showToast('Please select a video file', 'error');
        return;
      }

      setFiles({ ...files, [type]: file });

      // Create video preview URL
      const videoURL = URL.createObjectURL(file);
      setPreviews({ ...previews, [type]: videoURL });

      showToast(`${type === 'trailer' ? 'Trailer' : 'Video'} selected: ${file.name}`, 'success');
    }
  };

  // Add keyword tag
  const handleAddKeyword = () => {
    const trimmed = keywordInput.trim();
    if (trimmed && !formData.keywords.includes(trimmed)) {
      setFormData({ ...formData, keywords: [...formData.keywords, trimmed] });
      setKeywordInput('');
      setFormErrors({ ...formErrors, keywords: '' });
    }
  };

  // Remove keyword tag
  const handleRemoveKeyword = (keyword: string) => {
    setFormData({ ...formData, keywords: formData.keywords.filter(k => k !== keyword) });
  };

  // Handle keyword input on Enter key
  const handleKeywordKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  // Generate keywords using AI based on title and description
  const handleGenerateKeywords = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      showToast('Please enter title and description first', 'error');
      return;
    }

    setIsGeneratingKeywords(true);

    try {
      // Simulate AI keyword generation - Replace with actual AI API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock AI-generated keywords based on title and description
      const aiKeywords = [
        formData.title.toLowerCase().split(' ')[0],
        ...formData.genre.map(g => g.toLowerCase()),
        formData.language.toLowerCase(),
        formData.movieType.toLowerCase().replace(' ', '-'),
        'cinema',
        'movie',
        formData.releaseYear,
      ].filter(Boolean).slice(0, 8);

      // Remove duplicates and existing keywords
      const newKeywords = aiKeywords.filter(kw => !formData.keywords.includes(kw));

      if (newKeywords.length > 0) {
        setFormData({ ...formData, keywords: [...formData.keywords, ...newKeywords] });
        setFormErrors({ ...formErrors, keywords: '' });
        showToast(`Generated ${newKeywords.length} keywords successfully!`, 'success');
      } else {
        showToast('All keywords already added', 'success');
      }
    } catch (error) {
      showToast('Failed to generate keywords', 'error');
    } finally {
      setIsGeneratingKeywords(false);
    }
  };

  // Filter authors by search
  const filteredAuthors = availableAuthors.filter(author =>
    author.name.toLowerCase().includes(authorSearch.toLowerCase())
  );

  // Get selected author names
  const selectedAuthors = availableAuthors.filter(a => formData.authors.includes(a.id));

  // Simulate video upload with progress
  const simulateUpload = (type: 'trailer' | 'video') => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(prev => ({ ...prev, [type]: progress }));

        if (progress >= 100) {
          clearInterval(interval);
          resolve(true);
        }
      }, 500);
    });
  };

  // Toggle genre selection
  const toggleGenre = (genre: string) => {
    if (formData.genre.includes(genre)) {
      setFormData({ ...formData, genre: formData.genre.filter(g => g !== genre) });
    } else {
      setFormData({ ...formData, genre: [...formData.genre, genre] });
    }
    setFormErrors({ ...formErrors, genre: '' });
  };

  // Toggle author selection
  const toggleAuthor = (authorId: number) => {
    if (formData.authors.includes(authorId)) {
      setFormData({ ...formData, authors: formData.authors.filter(id => id !== authorId) });
    } else {
      setFormData({ ...formData, authors: [...formData.authors, authorId] });
    }
  };

  // Add new season
  const addSeason = () => {
    const newSeason: Season = {
      id: Date.now(),
      seasonNumber: seasons.length + 1,
      episodes: [],
    };
    setSeasons([...seasons, newSeason]);
  };

  // Remove season
  const removeSeason = (seasonId: number) => {
    setSeasons(seasons.filter(s => s.id !== seasonId));
  };

  // Add episode to season
  const addEpisode = (seasonId: number) => {
    setSeasons(seasons.map(season => {
      if (season.id === seasonId) {
        const newEpisode: Episode = {
          id: Date.now(),
          episodeNumber: season.episodes.length + 1,
          thumbnail: null,
          thumbnailPreview: '',
          platform: '',
          releaseDate: '',
          videoFile: null,
          videoPreview: '',
          uploadProgress: 0,
        };
        return { ...season, episodes: [...season.episodes, newEpisode] };
      }
      return season;
    }));
  };

  // Remove episode
  const removeEpisode = (seasonId: number, episodeId: number) => {
    setSeasons(seasons.map(season => {
      if (season.id === seasonId) {
        return { ...season, episodes: season.episodes.filter(e => e.id !== episodeId) };
      }
      return season;
    }));
  };

  // Handle episode thumbnail change
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
              episodes: season.episodes.map(ep => {
                if (ep.id === episodeId) {
                  return { ...ep, thumbnail: file, thumbnailPreview: reader.result as string };
                }
                return ep;
              }),
            };
          }
          return season;
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle episode video change
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
            episodes: season.episodes.map(ep => {
              if (ep.id === episodeId) {
                return { ...ep, videoFile: file, videoPreview: videoURL };
              }
              return ep;
            }),
          };
        }
        return season;
      }));

      showToast('Video selected successfully', 'success');
    }
  };

  // Update episode field
  const updateEpisodeField = (seasonId: number, episodeId: number, field: keyof Episode, value: any) => {
    setSeasons(seasons.map(season => {
      if (season.id === seasonId) {
        return {
          ...season,
          episodes: season.episodes.map(ep => {
            if (ep.id === episodeId) {
              return { ...ep, [field]: value };
            }
            return ep;
          }),
        };
      }
      return season;
    }));
  };

  // Load movie data in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      // Mock data loading - Replace with actual API call
      const mockMovie = {
        title: 'The Last Kingdom',
        releaseYear: '2024',
        genre: ['Action', 'Drama'],
        language: 'English',
        quality: 'FHD',
        description: 'A thrilling action drama series set in medieval times.',
        keywords: ['action', 'drama', 'medieval', 'war'],
        movieType: 'Full Movie',
        uploadType: 'full' as 'full' | 'series',
        price: '4.99',
        authors: [1, 2],
        status: 'publish' as 'draft' | 'publish' | 'unpublished',
      };

      setFormData((prev) => ({
        ...prev,
        ...mockMovie,
      }));

      // Mock image previews
      setPreviews((prev) => ({
        ...prev,
        poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop',
        cover: 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=800&h=450&fit=crop',
      }));

      showToast('Movie data loaded successfully', 'success');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, id]);

  // Validate form
  const validateForm = () => {
    const errors = {
      title: '',
      releaseYear: '',
      genre: '',
      language: '',
      quality: '',
      description: '',
      keywords: '',
      movieType: '',
      price: '',
      poster: '',
      cover: '',
    };

    let isValid = true;

    if (!formData.title.trim()) {
      errors.title = 'Movie title is required';
      isValid = false;
    }

    if (!formData.releaseYear.trim()) {
      errors.releaseYear = 'Release year is required';
      isValid = false;
    } else if (!/^\d{4}$/.test(formData.releaseYear)) {
      errors.releaseYear = 'Please enter a valid year (e.g., 2024)';
      isValid = false;
    }

    if (formData.genre.length === 0) {
      errors.genre = 'Please select at least one genre';
      isValid = false;
    }

    if (!formData.language) {
      errors.language = 'Language is required';
      isValid = false;
    }

    if (!formData.quality) {
      errors.quality = 'Video quality is required';
      isValid = false;
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
      isValid = false;
    }

    if (formData.keywords.length === 0) {
      errors.keywords = 'At least one keyword is required for SEO';
      isValid = false;
    }

    if (!formData.movieType) {
      errors.movieType = 'Movie type is required';
      isValid = false;
    }

    if (!formData.price.trim()) {
      errors.price = 'Price is required';
      isValid = false;
    } else if (isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      errors.price = 'Please enter a valid price';
      isValid = false;
    }

    if (!files.poster) {
      errors.poster = 'Poster image is required';
      isValid = false;
    }

    if (!files.cover) {
      errors.cover = 'Cover image is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validateForm()) {
      showToast('Please fix all errors before submitting', 'error');
      return;
    }

    setIsUploading(true);

    try {
      // Simulate trailer upload if exists
      if (files.trailer) {
        await simulateUpload('trailer');
      }

      // Simulate video upload if exists
      if (files.video) {
        await simulateUpload('video');
      }

      // Here you would normally send the data to your backend
      console.log('Form Data:', formData);
      console.log('Files:', files);
      console.log('Seasons:', seasons);

      showToast(isEditMode ? 'Movie updated successfully!' : 'Movie created successfully!', 'success');

      // Navigate back to movies page after 2 seconds
      setTimeout(() => {
        navigate('/movies');
      }, 2000);
    } catch (error) {
      showToast('Failed to create movie', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate('/movies')}
            className="p-2 rounded-lg bg-[#18181b] border border-[#27272a] text-white hover:bg-[#27272a] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-white text-xl sm:text-2xl lg:text-3xl font-bold mb-1">{isEditMode ? 'Edit Movie' : 'Add New Movie'}</h1>
            <p className="text-[#71717a] text-sm">{isEditMode ? 'Update movie details and information' : 'Create a new movie entry with all details'}</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Images Section */}
          <div>
            <h2 className="text-white text-base sm:text-lg font-bold mb-3 sm:mb-4">រូបភាព (Images)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Poster - Vertical */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  រូបភាព​បញ្ឈរ (Poster - Vertical) *
                </label>
                <div
                  onClick={() => posterInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-colors ${
                    formErrors.poster ? 'border-[#ef4444]' : 'border-[#27272a] hover:border-[#3f3f46]'
                  } ${previews.poster ? 'h-48' : 'h-32'}`}
                >
                  {previews.poster ? (
                    <>
                      <img src={previews.poster} alt="Poster preview" className="w-full h-full object-cover" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFiles({ ...files, poster: null });
                          setPreviews({ ...previews, poster: '' });
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-[#ef4444] text-white hover:bg-[#dc2626] transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                      <Upload className="w-8 h-8 text-[#71717a] mb-2" />
                      <p className="text-white text-sm font-medium mb-1">Upload Poster</p>
                      <p className="text-[#71717a] text-xs">2:3 ratio</p>
                    </div>
                  )}
                </div>
                <input
                  ref={posterInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange('poster', e)}
                  className="hidden"
                />
                {formErrors.poster && (
                  <p className="text-[#ef4444] text-xs mt-1">{formErrors.poster}</p>
                )}
              </div>

              {/* Cover - Horizontal */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  រូបភាព​ផ្តេក (Cover - Horizontal) *
                </label>
                <div
                  onClick={() => coverInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-colors ${
                    formErrors.cover ? 'border-[#ef4444]' : 'border-[#27272a] hover:border-[#3f3f46]'
                  } ${previews.cover ? 'h-48' : 'h-32'}`}
                >
                  {previews.cover ? (
                    <>
                      <img src={previews.cover} alt="Cover preview" className="w-full h-full object-cover" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFiles({ ...files, cover: null });
                          setPreviews({ ...previews, cover: '' });
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-[#ef4444] text-white hover:bg-[#dc2626] transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                      <Upload className="w-8 h-8 text-[#71717a] mb-2" />
                      <p className="text-white text-sm font-medium mb-1">Upload Cover</p>
                      <p className="text-[#71717a] text-xs">16:9 ratio</p>
                    </div>
                  )}
                </div>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange('cover', e)}
                  className="hidden"
                />
                {formErrors.cover && (
                  <p className="text-[#ef4444] text-xs mt-1">{formErrors.cover}</p>
                )}
              </div>
            </div>
          </div>

          {/* Upload Type Selection */}
          <div>
            <h2 className="text-white text-base sm:text-lg font-bold mb-3 sm:mb-4">ប្រភេទអាប់ឡូត (Upload Type)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, uploadType: 'full' })}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  formData.uploadType === 'full'
                    ? 'bg-gradient-to-r from-[#ef4444] to-[#f97316] text-white'
                    : 'bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46]'
                }`}
              >
                Full Movie
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, uploadType: 'series' })}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  formData.uploadType === 'series'
                    ? 'bg-gradient-to-r from-[#ef4444] to-[#f97316] text-white'
                    : 'bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46]'
                }`}
              >
                Series/Episodes
              </button>
            </div>
          </div>

          {/* Basic Information */}
          <div>
            <h2 className="text-white text-base sm:text-lg font-bold mb-3 sm:mb-4">ព័ត៌មានមូលដ្ឋាន (Basic Information)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Title */}
              <div className="sm:col-span-2">
                <label className="block text-white text-sm font-medium mb-2">
                  ចំណងជើងភាពយន្ត (Movie Title) *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full bg-[#0a0a0a] text-white placeholder:text-[#52525b] px-4 py-2.5 rounded-lg border ${
                    formErrors.title ? 'border-[#ef4444]' : 'border-[#27272a]'
                  } focus:outline-none focus:border-[#3f3f46] transition-colors text-sm`}
                  placeholder="Enter movie title"
                />
                {formErrors.title && (
                  <p className="text-[#ef4444] text-xs mt-1">{formErrors.title}</p>
                )}
              </div>

              {/* Release Year - Dropdown */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  ឆ្នាំចេញផ្សាយ (Release Year) *
                </label>
                <select
                  value={formData.releaseYear}
                  onChange={(e) => setFormData({ ...formData, releaseYear: e.target.value })}
                  className={`w-full bg-[#0a0a0a] text-white px-4 py-2.5 rounded-lg border ${
                    formErrors.releaseYear ? 'border-[#ef4444]' : 'border-[#27272a]'
                  } focus:outline-none focus:border-[#3f3f46] transition-colors text-sm`}
                >
                  <option value="">Select year</option>
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                {formErrors.releaseYear && (
                  <p className="text-[#ef4444] text-xs mt-1">{formErrors.releaseYear}</p>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  តម្លៃសម្រាប់ទិញ (Price) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className={`w-full bg-[#0a0a0a] text-white placeholder:text-[#52525b] px-4 py-2.5 rounded-lg border ${
                    formErrors.price ? 'border-[#ef4444]' : 'border-[#27272a]'
                  } focus:outline-none focus:border-[#3f3f46] transition-colors text-sm`}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
                {formErrors.price && (
                  <p className="text-[#ef4444] text-xs mt-1">{formErrors.price}</p>
                )}
              </div>
            </div>
          </div>

          {/* Genre Selection */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              បណ្តុំរឿង (Genre) *
            </label>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {genreOptions.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => toggleGenre(genre)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    formData.genre.includes(genre)
                      ? 'bg-gradient-to-r from-[#ef4444] to-[#f97316] text-white'
                      : 'bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46]'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
            {formErrors.genre && (
              <p className="text-[#ef4444] text-xs mt-1">{formErrors.genre}</p>
            )}
          </div>

          {/* Language & Quality */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Language */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                ភាសា (Language) *
              </label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className={`w-full bg-[#0a0a0a] text-white px-4 py-2.5 rounded-lg border ${
                  formErrors.language ? 'border-[#ef4444]' : 'border-[#27272a]'
                } focus:outline-none focus:border-[#3f3f46] transition-colors text-sm`}
              >
                <option value="">Select language</option>
                {languageOptions.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
              {formErrors.language && (
                <p className="text-[#ef4444] text-xs mt-1">{formErrors.language}</p>
              )}
            </div>

            {/* Quality */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                កម្រឹតវីដេអូ (Video Quality) *
              </label>
              <select
                value={formData.quality}
                onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                className={`w-full bg-[#0a0a0a] text-white px-4 py-2.5 rounded-lg border ${
                  formErrors.quality ? 'border-[#ef4444]' : 'border-[#27272a]'
                } focus:outline-none focus:border-[#3f3f46] transition-colors text-sm`}
              >
                <option value="">Select quality</option>
                {qualityOptions.map((quality) => (
                  <option key={quality} value={quality}>{quality}</option>
                ))}
              </select>
              {formErrors.quality && (
                <p className="text-[#ef4444] text-xs mt-1">{formErrors.quality}</p>
              )}
            </div>
          </div>

          {/* Movie Type */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              ប្រភេទរឿង (Movie Type) *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {movieTypeOptions.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, movieType: type })}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    formData.movieType === type
                      ? 'bg-gradient-to-r from-[#ef4444] to-[#f97316] text-white'
                      : 'bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            {formErrors.movieType && (
              <p className="text-[#ef4444] text-xs mt-1">{formErrors.movieType}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              ការពិពណ៌នា (Description) *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={5}
              className={`w-full bg-[#0a0a0a] text-white placeholder:text-[#52525b] px-4 py-2.5 rounded-lg border ${
                formErrors.description ? 'border-[#ef4444]' : 'border-[#27272a]'
              } focus:outline-none focus:border-[#3f3f46] transition-colors text-sm resize-none`}
              placeholder="Enter movie story and description..."
            />
            {formErrors.description && (
              <p className="text-[#ef4444] text-xs mt-1">{formErrors.description}</p>
            )}
          </div>

          {/* Keywords - Tag Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-white text-sm font-medium">
                ពាក្យគន្លឹះ (Keywords for SEO) *
              </label>
              <button
                type="button"
                onClick={handleGenerateKeywords}
                disabled={isGeneratingKeywords}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] rounded-lg text-white text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGeneratingKeywords ? 'animate-spin' : ''}`} />
                {isGeneratingKeywords ? 'Generating...' : 'Generate with AI'}
              </button>
            </div>
            <div className={`w-full bg-[#0a0a0a] rounded-lg border ${
              formErrors.keywords ? 'border-[#ef4444]' : 'border-[#27272a]'
            } p-2`}>
              {/* Tags Display */}
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#27272a] text-white text-sm rounded-lg"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="hover:text-[#ef4444] transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              {/* Input */}
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={handleKeywordKeyPress}
                className="w-full bg-transparent text-white placeholder:text-[#52525b] px-2 py-1 focus:outline-none text-sm"
                placeholder="Type keyword and press Enter..."
              />
            </div>
            {formErrors.keywords && (
              <p className="text-[#ef4444] text-xs mt-1">{formErrors.keywords}</p>
            )}
            <p className="text-[#71717a] text-xs mt-1">Press Enter to add keywords or use AI to generate (e.g., action, thriller, khmer)</p>
          </div>

          {/* Authors Selection - Search and Select */}
          <div className="relative">
            <label className="block text-white text-sm font-medium mb-2">
              តួអង្គ (Cast/Authors)
            </label>

            {/* Selected Authors Display */}
            {selectedAuthors.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedAuthors.map((author) => (
                  <span
                    key={author.id}
                    className="inline-flex items-center gap-2 pl-1 pr-3 py-1 bg-[#3b82f6] text-white text-sm rounded-lg"
                  >
                    <img
                      src={author.profile}
                      alt={author.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    {author.name}
                    <button
                      type="button"
                      onClick={() => toggleAuthor(author.id)}
                      className="hover:text-[#ef4444] transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={authorSearch}
                onChange={(e) => setAuthorSearch(e.target.value)}
                onFocus={() => setShowAuthorDropdown(true)}
                className="w-full bg-[#0a0a0a] text-white placeholder:text-[#52525b] pl-10 pr-4 py-2.5 rounded-lg border border-[#27272a] focus:outline-none focus:border-[#3f3f46] transition-colors text-sm"
                placeholder="Search authors..."
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b]" />
            </div>

            {/* Dropdown List */}
            {showAuthorDropdown && authorSearch && (
              <div className="absolute z-10 w-full mt-1 bg-[#18181b] border border-[#27272a] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredAuthors.length > 0 ? (
                  filteredAuthors.map((author) => (
                    <button
                      key={author.id}
                      type="button"
                      onClick={() => {
                        toggleAuthor(author.id);
                        setAuthorSearch('');
                        setShowAuthorDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 hover:bg-[#27272a] transition-colors ${
                        formData.authors.includes(author.id) ? 'bg-[#27272a] text-[#3b82f6]' : 'text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={author.profile}
                            alt={author.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <span className="text-sm">{author.name}</span>
                        </div>
                        {formData.authors.includes(author.id) && (
                          <Check className="w-4 h-4" />
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-[#71717a] text-sm">No authors found</div>
                )}
              </div>
            )}
          </div>

          {/* Video Uploads */}
          <div>
            <h2 className="text-white text-base sm:text-lg font-bold mb-3 sm:mb-4">វីដេអូ (Videos)</h2>
            <div className="space-y-4">
              {/* Trailer Upload */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  ឈុតខ្លីៗ (Trailer)
                </label>
                <div
                  onClick={() => trailerInputRef.current?.click()}
                  className="relative border-2 border-dashed border-[#27272a] rounded-xl p-6 cursor-pointer hover:border-[#3f3f46] transition-colors"
                >
                  {files.trailer ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Film className="w-8 h-8 text-[#3b82f6]" />
                        <div>
                          <p className="text-white text-sm font-medium">{files.trailer.name}</p>
                          <p className="text-[#71717a] text-xs">{(files.trailer.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFiles({ ...files, trailer: null });
                          setPreviews({ ...previews, trailer: '' });
                          setUploadProgress({ ...uploadProgress, trailer: 0 });
                        }}
                        className="p-1.5 rounded-lg bg-[#ef4444] text-white hover:bg-[#dc2626] transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center">
                      <Upload className="w-10 h-10 text-[#71717a] mb-2" />
                      <p className="text-white text-sm font-medium">Upload Trailer Video</p>
                      <p className="text-[#71717a] text-xs mt-1">Click to browse or drag and drop</p>
                    </div>
                  )}
                </div>
                <input
                  ref={trailerInputRef}
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleVideoChange('trailer', e)}
                  className="hidden"
                />
                {uploadProgress.trailer > 0 && uploadProgress.trailer < 100 && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-[#71717a]">Uploading...</span>
                      <span className="text-white">{uploadProgress.trailer}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#27272a] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#ef4444] to-[#f97316] transition-all duration-300"
                        style={{ width: `${uploadProgress.trailer}%` }}
                      />
                    </div>
                  </div>
                )}
                {/* Video Preview */}
                {previews.trailer && (
                  <div className="mt-3 border border-[#27272a] rounded-xl overflow-hidden bg-[#0a0a0a]">
                    <div className="p-3 bg-[#18181b] border-b border-[#27272a] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Play className="w-4 h-4 text-[#3b82f6]" />
                        <span className="text-white text-sm font-medium">Trailer Preview</span>
                      </div>
                    </div>
                    <video
                      src={previews.trailer}
                      controls
                      className="w-full"
                      style={{ maxHeight: '300px' }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
              </div>

              {/* Full Video Upload - Only for Full Movie */}
              {formData.uploadType === 'full' && (
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    វីដេអូពេញលេញ (Full Movie Video)
                  </label>
                  <div
                    onClick={() => videoInputRef.current?.click()}
                    className="relative border-2 border-dashed border-[#27272a] rounded-xl p-6 cursor-pointer hover:border-[#3f3f46] transition-colors"
                  >
                    {files.video ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Film className="w-8 h-8 text-[#22c55e]" />
                          <div>
                            <p className="text-white text-sm font-medium">{files.video.name}</p>
                            <p className="text-[#71717a] text-xs">{(files.video.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFiles({ ...files, video: null });
                            setPreviews({ ...previews, video: '' });
                            setUploadProgress({ ...uploadProgress, video: 0 });
                          }}
                          className="p-1.5 rounded-lg bg-[#ef4444] text-white hover:bg-[#dc2626] transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center">
                        <Upload className="w-10 h-10 text-[#71717a] mb-2" />
                        <p className="text-white text-sm font-medium">Upload Full Video</p>
                        <p className="text-[#71717a] text-xs mt-1">Click to browse or drag and drop</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleVideoChange('video', e)}
                    className="hidden"
                  />
                  {uploadProgress.video > 0 && uploadProgress.video < 100 && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-[#71717a]">Processing...</span>
                        <span className="text-white">{uploadProgress.video}%</span>
                      </div>
                      <div className="w-full h-2 bg-[#27272a] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#22c55e] to-[#16a34a] transition-all duration-300"
                          style={{ width: `${uploadProgress.video}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {previews.video && (
                    <div className="mt-3 border border-[#27272a] rounded-xl overflow-hidden bg-[#0a0a0a]">
                      <div className="p-3 bg-[#18181b] border-b border-[#27272a] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Play className="w-4 h-4 text-[#22c55e]" />
                          <span className="text-white text-sm font-medium">Video Preview</span>
                        </div>
                      </div>
                      <video
                        src={previews.video}
                        controls
                        className="w-full"
                        style={{ maxHeight: '400px' }}
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                </div>
              )}

              {/* Series Episodes Management - Only for Series */}
              {formData.uploadType === 'series' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-white text-sm font-medium">
                      វគ្គ (Seasons & Episodes)
                    </label>
                    <button
                      type="button"
                      onClick={addSeason}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ef4444] to-[#f97316] rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      <Plus className="w-4 h-4" />
                      Add Season
                    </button>
                  </div>

                  {seasons.length === 0 ? (
                    <div className="border-2 border-dashed border-[#27272a] rounded-xl p-8 text-center">
                      <p className="text-[#71717a] text-sm">No seasons added yet. Click "Add Season" to start.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {seasons.map((season) => (
                        <div key={season.id} className="border border-[#27272a] rounded-xl p-4 bg-[#0a0a0a]">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <h3 className="text-white font-medium">Season {season.seasonNumber}</h3>
                              <button
                                type="button"
                                onClick={() => addEpisode(season.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ef4444] rounded-lg text-white text-xs font-medium hover:bg-[#dc2626] transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeSeason(season.id)}
                              className="p-1.5 rounded-lg bg-[#27272a] text-[#71717a] hover:bg-[#ef4444] hover:text-white transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          {season.episodes.length === 0 ? (
                            <div className="border border-[#27272a] rounded-lg p-6 text-center">
                              <p className="text-[#71717a] text-sm">No episodes yet. Click + to add episode.</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {season.episodes.map((episode, index) => (
                                <div key={episode.id} className="border border-[#27272a] rounded-lg p-4 bg-[#18181b]">
                                  <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 text-white font-medium w-8">{index + 1}</div>

                                    {/* Thumbnail */}
                                    <div className="flex-shrink-0">
                                      <div
                                        onClick={() => document.getElementById(`episode-thumb-${season.id}-${episode.id}`)?.click()}
                                        className="w-20 h-20 bg-[#27272a] rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center"
                                      >
                                        {episode.thumbnailPreview ? (
                                          <img src={episode.thumbnailPreview} alt="Episode" className="w-full h-full object-cover" />
                                        ) : (
                                          <Upload className="w-6 h-6 text-[#71717a]" />
                                        )}
                                      </div>
                                      <input
                                        id={`episode-thumb-${season.id}-${episode.id}`}
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleEpisodeThumbnailChange(season.id, episode.id, e)}
                                        className="hidden"
                                      />
                                    </div>

                                    {/* Episode Details */}
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                                      {/* Upload Video Button */}
                                      <div>
                                        <button
                                          type="button"
                                          onClick={() => document.getElementById(`episode-video-${season.id}-${episode.id}`)?.click()}
                                          className="w-full px-3 py-2 bg-gradient-to-r from-[#ef4444] to-[#f97316] rounded-lg text-white text-xs font-medium hover:opacity-90 transition-opacity"
                                        >
                                          {episode.videoFile ? 'Change Video' : 'អាប់ឡូត'}
                                        </button>
                                        <input
                                          id={`episode-video-${season.id}-${episode.id}`}
                                          type="file"
                                          accept="video/*"
                                          onChange={(e) => handleEpisodeVideoChange(season.id, episode.id, e)}
                                          className="hidden"
                                        />
                                        {episode.videoFile && (
                                          <p className="text-[#22c55e] text-xs mt-1 truncate">{episode.videoFile.name}</p>
                                        )}
                                      </div>

                                      {/* Platform */}
                                      <div>
                                        <input
                                          type="text"
                                          value={episode.platform}
                                          onChange={(e) => updateEpisodeField(season.id, episode.id, 'platform', e.target.value)}
                                          placeholder="បណ្តាញ"
                                          className="w-full bg-[#0a0a0a] text-white placeholder:text-[#52525b] px-3 py-2 rounded-lg border border-[#27272a] focus:outline-none focus:border-[#3f3f46] transition-colors text-xs"
                                        />
                                      </div>

                                      {/* Release Date */}
                                      <div>
                                        <input
                                          type="date"
                                          value={episode.releaseDate}
                                          onChange={(e) => updateEpisodeField(season.id, episode.id, 'releaseDate', e.target.value)}
                                          className="w-full bg-[#0a0a0a] text-white px-3 py-2 rounded-lg border border-[#27272a] focus:outline-none focus:border-[#3f3f46] transition-colors text-xs"
                                        />
                                      </div>
                                    </div>

                                    {/* Remove Episode */}
                                    <button
                                      type="button"
                                      onClick={() => removeEpisode(season.id, episode.id)}
                                      className="flex-shrink-0 p-2 rounded-lg bg-[#ef4444] text-white hover:bg-[#dc2626] transition-colors"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>

                                  {/* Video Preview */}
                                  {episode.videoPreview && (
                                    <div className="mt-3 border border-[#27272a] rounded-lg overflow-hidden">
                                      <div className="p-2 bg-[#0a0a0a] border-b border-[#27272a] flex items-center gap-2">
                                        <Play className="w-3.5 h-3.5 text-[#22c55e]" />
                                        <span className="text-white text-xs font-medium">Preview</span>
                                      </div>
                                      <video
                                        src={episode.videoPreview}
                                        controls
                                        className="w-full"
                                        style={{ maxHeight: '200px' }}
                                      >
                                        Your browser does not support the video tag.
                                      </video>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              ស្ថានភាព (Movie Status)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'draft' })}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  formData.status === 'draft'
                    ? 'bg-[#f59e0b] text-white'
                    : 'bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46]'
                }`}
              >
                Draft
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'publish' })}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  formData.status === 'publish'
                    ? 'bg-[#22c55e] text-white'
                    : 'bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46]'
                }`}
              >
                Publish
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'unpublished' })}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  formData.status === 'unpublished'
                    ? 'bg-[#ef4444] text-white'
                    : 'bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46]'
                }`}
              >
                Unpublished
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-[#27272a]">
            <button
              type="button"
              onClick={() => navigate('/movies')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#27272a] text-white text-sm font-medium hover:bg-[#3f3f46] transition-colors order-2 sm:order-1"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isUploading}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#ef4444] to-[#f97316] text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
            >
              {isUploading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Movie' : 'Create Movie')}
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
            toast.type === 'success'
              ? 'bg-[#22c55e] text-white'
              : 'bg-[#ef4444] text-white'
          }`}>
            {toast.type === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default AddMovie;
