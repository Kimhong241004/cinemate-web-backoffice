import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { useNotification } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import { useUploadManager } from '../../context/UploadManagerContext';
import MovieForm, { MovieFormValues, MovieFormFiles } from '../../components/moviesform/MovieForm';
import { movieService, MovieFromApi, CreateMovieData } from '../../../api/services/movieService';
import { Episode, Season, SliderImage } from '../../../types/movie';
import { pollConvertStatus } from '../../utils/pollConvertStatus';

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
  country: movie.country,
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

// Existing seasons/episodes ride in on the movie detail response — map them into the
// form's local shape so opening Edit on a series shows what's already saved instead of
// an empty Seasons section. Episodes are matched back to the API by season_number/
// episode_number on submit (not by id), so these ids only need to be stable react keys.
const toSeasons = (movie: MovieFromApi): Season[] =>
  (movie.seasons ?? []).map((season, si) => ({
    id: Date.now() + si,
    globalId: season.global_id,
    seasonNumber: season.season_number,
    episodes: season.episodes.map((episode, ei) => ({
      id: Date.now() + si * 1000 + ei + 1,
      globalId: episode.global_id,
      isLocked: episode.isLocked,
      episodeNumber: episode.episode_number,
      title: episode.title,
      // "Free episode" reflects the server's real lock state for existing episodes —
      // toggling it calls the lock/unlock endpoint directly rather than resending is_free.
      isFree: !episode.isLocked,
      thumbnail: null,
      thumbnailPreview: '',
      platform: '',
      releaseDate: episode.release_date ? episode.release_date.substring(0, 10) : '',
      videoFile: null,
      videoPreview: episode.movie_url ?? '',
      uploadProgress: episode.movie_url ? 100 : 0,
      convertStatus: episode.convert_status || undefined,
    })),
  }));

const EditMovie = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useNotification();
  const { t } = useLanguage();
  const { startBackgroundUpload } = useUploadManager();
  const fromPage = searchParams.get('page');
  const backToMovies = fromPage ? `/movies?page=${fromPage}` : '/movies';

  const [movie, setMovie] = useState<MovieFromApi | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    movieService.getMovie(id)
      .then(setMovie)
      .catch(() => showToast(t.movies.form.failedLoadMovieData, 'error'))
      .finally(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (
    values: MovieFormValues,
    files: MovieFormFiles,
    seasons: Season[],
    updateEpisodeField: (seasonId: number, episodeId: number, field: keyof Episode, value: any) => void,
    sliders: SliderImage[]
  ) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      // Episode videos ride inside the updateMovie payload (each needs an upload_id
      // up front), so unlike the trailer/full-movie video they can't be backgrounded —
      // upload them first and block on it. Omitted entirely when the admin didn't touch
      // the Seasons section, so existing episodes on the server aren't wiped out.
      // Conversion (transcoding) happens after the upload_id already exists, so it's
      // fine to just kick off a watcher for the progress UI without blocking submission.
      let seasonsPayload: CreateMovieData['seasons'];
      if (values.uploadType === 'series' && seasons.length > 0) {
        seasonsPayload = await Promise.all(
          seasons.map(async (season) => ({
            season_number: season.seasonNumber,
            episodes: await Promise.all(
              season.episodes.map(async (episode) => {
                // Free/locked status for an existing episode is set via the dedicated lock
                // endpoint the moment the checkbox is toggled (see toggleEpisodeFree), not
                // resent here — is_free only matters for episodes being created for the
                // first time, since there's nothing else to set their initial lock state.
                const isFree = episode.globalId ? undefined : episode.isFree;
                if (!episode.videoFile) {
                  return { episode_number: episode.episodeNumber, title: episode.title, release_date: episode.releaseDate || undefined, is_free: isFree, upload_id: undefined };
                }
                const uploadGlobalId = await movieService.uploadFileInChunks('movie', episode.videoFile, (pct) =>
                  updateEpisodeField(season.id, episode.id, 'uploadProgress', pct)
                );
                pollConvertStatus(uploadGlobalId, (convertStatus) =>
                  updateEpisodeField(season.id, episode.id, 'convertStatus', convertStatus)
                );
                return {
                  episode_number: episode.episodeNumber,
                  title: episode.title,
                  release_date: episode.releaseDate || undefined,
                  is_free: isFree,
                  upload_id: uploadGlobalId,
                };
              })
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
        country: values.country,
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

      // The media endpoint takes one slider_file per call, so each newly selected slider
      // image is uploaded as its own request, in the order the admin added them.
      for (const slider of sliders) {
        if (slider.file) {
          await movieService.uploadMedia(id, { slider_file: slider.file });
        }
      }

      if (files.trailer) startBackgroundUpload(id, 'trailer', files.trailer);
      if (files.video) startBackgroundUpload(id, 'movie', files.video);

      showToast(
        files.trailer || files.video
          ? t.movies.form.movieUpdatedBgUpload
          : t.movies.form.movieUpdatedSuccess,
        'success'
      );
      navigate(backToMovies);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : t.movies.form.failedUpdateMovie, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#ef4444] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#71717a] text-sm">{t.movies.form.loadingMovieData}</p>
        </div>
      </div>
    );
  }

  return (
    <MovieForm
      title={t.movies.form.editTitle}
      subtitle={t.movies.form.editSubtitle}
      submitLabel={t.movies.form.updateBtn}
      submittingLabel={t.movies.form.updatingBtn}
      isSubmitting={isSubmitting}
      initialValues={movie ? toFormValues(movie) : undefined}
      initialPreviews={{
        poster: movie?.poster_url ?? '',
        cover: movie?.cover_url ?? '',
        trailer: movie?.trailer_url ?? '',
        video: movie?.sources?.[0]?.movie_url ?? '',
      }}
      initialSeasons={movie ? toSeasons(movie) : undefined}
      onCancel={() => navigate(backToMovies)}
      onSubmit={handleSubmit}
      showToast={showToast}
    />
  );
};

export default EditMovie;
