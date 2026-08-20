import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useNotification } from '../../context/NotificationContext';
import { useUploadManager } from '../../context/UploadManagerContext';
import MovieForm, { MovieFormValues, MovieFormFiles } from '../../components/moviesform/MovieForm';
import { movieService, MovieFromApi, CreateMovieData } from '../../../api/services/movieService';
import { Season } from '../../../types/movie';

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
  genre: movie.genres.map((g) => g.global_id),
  language: movie.language,
  quality: qualityFromApi[movie.video_quality] ?? 'HD',
  description: movie.description,
  keywords: movie.keywords ? movie.keywords.split(',').map((k) => k.trim()).filter(Boolean) : [],
  accessType: movie.movie_type ? [movie.movie_type as 'buy' | 'membership' | 'free'] : [],
  uploadType: movie.content_type === 'series' ? 'series' : 'full',
  price: String(movie.base_price),
  episodePrice: movie.price_per_episode !== undefined ? String(movie.price_per_episode) : '',
  authors: movie.movie_authors.map((a) => a.global_id),
  status: movie.movie_status === 'published' ? 'publish' : movie.movie_status === 'unpublished' ? 'unpublished' : 'draft',
});

const EditMovie = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useNotification();
  const { startBackgroundUpload } = useUploadManager();

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

  const handleSubmit = async (values: MovieFormValues, files: MovieFormFiles, seasons: Season[]) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      // Episode videos ride inside the updateMovie payload (each needs an upload_id
      // up front), so unlike the trailer/full-movie video they can't be backgrounded —
      // upload them first and block on it. Omitted entirely when the admin didn't touch
      // the Seasons section, so existing episodes on the server aren't wiped out.
      let seasonsPayload: CreateMovieData['seasons'];
      if (values.uploadType === 'series' && seasons.length > 0) {
        seasonsPayload = await Promise.all(
          seasons.map(async (season) => ({
            season_number: season.seasonNumber,
            episodes: await Promise.all(
              season.episodes.map(async (episode) => ({
                episode_number: episode.episodeNumber,
                title: episode.title,
                release_date: episode.releaseDate || undefined,
                is_free: episode.isFree,
                upload_id: episode.videoFile
                  ? await movieService.uploadFileInChunks('movie', episode.videoFile)
                  : undefined,
              }))
            ),
          }))
        );
      }

      // Update the movie's fields right away without waiting for a replacement
      // trailer/video to finish uploading — large files are handed off to the
      // background upload manager below and attached once done.
      await movieService.updateMovie(id, {
        content_type: values.uploadType === 'series' ? 'series' : 'movie',
        title: values.title,
        description: values.description,
        release_date: `${values.releaseYear}-01-01`,
        base_price: Number(values.price),
        price_per_episode: values.episodePrice ? Number(values.episodePrice) : undefined,
        language: values.language,
        video_quality: qualityToApi[values.quality] ?? 'hd',
        movie_type: values.accessType[0] ?? 'free',
        keywords: values.keywords.join(','),
        movie_status: values.status === 'publish' ? 'published' : values.status === 'unpublished' ? 'unpublished' : 'draft',
        status: 1,
        author_ids: values.authors,
        genre_ids: values.genre,
        seasons: seasonsPayload,
      });

      if (files.poster || files.cover) {
        await movieService.uploadMedia(id, {
          poster_file: files.poster ?? undefined,
          cover_file: files.cover ?? undefined,
        });
      }

      if (files.trailer) startBackgroundUpload(id, 'trailer', files.trailer);
      if (files.video) startBackgroundUpload(id, 'movie', files.video);

      showToast(
        files.trailer || files.video
          ? 'Movie updated — video is uploading in the background, check the Movies list for progress'
          : 'Movie updated successfully!',
        'success'
      );
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
      initialPreviews={{
        poster: movie?.poster_url ?? '',
        cover: movie?.cover_url ?? '',
        trailer: movie?.trailer_url ?? '',
        video: movie?.sources?.[0]?.movie_url ?? '',
      }}
      onCancel={() => navigate('/movies')}
      onSubmit={handleSubmit}
      showToast={showToast}
    />
  );
};

export default EditMovie;
