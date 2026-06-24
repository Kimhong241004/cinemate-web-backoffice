import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useNotification } from '../../context/NotificationContext';
import MovieForm, { MovieFormValues, MovieFormFiles } from '../../components/moviesform/MovieForm';
import { movieService, MovieFromApi } from '../../../api/services/movieService';

const qualityFromApi: Record<string, string> = {
  full_hd: 'FHD',
  hd: 'HD',
  four_k: 'FHD',
};

const qualityToApi: Record<string, string> = {
  FHD: 'full_hd',
  HD: 'hd',
  SD: 'hd',
};

const toFormValues = (movie: MovieFromApi): Partial<MovieFormValues> => ({
  title: movie.title,
  releaseYear: movie.release_date ? movie.release_date.substring(0, 4) : '',
  genre: movie.genres.map((g) => g.name),
  language: movie.language,
  quality: qualityFromApi[movie.video_quality] ?? 'HD',
  description: movie.description,
  keywords: movie.keywords ? movie.keywords.split(',').map((k) => k.trim()).filter(Boolean) : [],
  accessType: movie.movie_type ? [movie.movie_type as 'buy' | 'membership' | 'free'] : [],
  uploadType: movie.content_type === 'series' ? 'series' : 'full',
  price: String(movie.base_price),
  status: movie.movie_status === 'published' ? 'publish' : movie.movie_status === 'unpublished' ? 'unpublished' : 'draft',
});

const EditMovie = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useNotification();

  const [movie, setMovie] = useState<MovieFromApi | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    movieService.getMovie(id)
      .then(setMovie)
      .catch(() => showToast('Failed to load movie data', 'error'))
      .finally(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (values: MovieFormValues, files: MovieFormFiles) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await movieService.updateMovie(id, {
        content_type: values.uploadType === 'series' ? 'series' : 'movie',
        title: values.title,
        description: values.description,
        release_date: `${values.releaseYear}-01-01`,
        base_price: Number(values.price),
        language: values.language,
        video_quality: qualityToApi[values.quality] ?? 'hd',
        movie_type: values.accessType[0] ?? 'free',
        keywords: values.keywords.join(','),
        movie_status: values.status === 'publish' ? 'published' : values.status === 'unpublished' ? 'unpublished' : 'draft',
        status: 1,
        author_ids: [],
        genre_ids: [],
      });

      if (files.poster || files.cover || files.trailer || files.video) {
        await movieService.uploadFiles(id, {
          poster_file: files.poster ?? undefined,
          cover_file: files.cover ?? undefined,
          trailer_file: files.trailer ?? undefined,
          movie_file: files.video ?? undefined,
        });
      }

      showToast('Movie updated successfully!', 'success');
      navigate('/movies');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to update movie', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#ef4444] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#71717a] text-sm">Loading movie data...</p>
        </div>
      </div>
    );
  }

  return (
    <MovieForm
      title="Edit Movie"
      subtitle="Update movie details and information"
      submitLabel="Update Movie"
      submittingLabel="Updating..."
      isSubmitting={isSubmitting}
      initialValues={movie ? toFormValues(movie) : undefined}
      initialPreviews={{ poster: movie?.poster_url ?? '', cover: movie?.cover_url ?? '' }}
      onCancel={() => navigate('/movies')}
      onSubmit={handleSubmit}
      showToast={showToast}
    />
  );
};

export default EditMovie;
