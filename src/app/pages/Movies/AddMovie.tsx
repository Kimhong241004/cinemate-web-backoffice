import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useNotification } from '../../context/NotificationContext';
import { useUploadManager } from '../../context/UploadManagerContext';
import MovieForm, { MovieFormValues, MovieFormFiles } from '../../components/moviesform/MovieForm';
import { movieService, CreateMovieData } from '../../../api/services/movieService';
import { Season } from '../../../types/movie';

const qualityToApi: Record<string, string> = {
  FHD: 'full_hd',
  HD: 'hd',
  SD: 'hd',
};

const AddMovie = () => {
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const { startBackgroundUpload } = useUploadManager();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: MovieFormValues, files: MovieFormFiles, seasons: Season[]) => {
    setIsSubmitting(true);
    try {
      // Episode videos ride inside the createMovie payload (each needs an upload_id
      // up front), so unlike the trailer/full-movie video they can't be backgrounded —
      // upload them first and block on it.
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

      // Create the movie right away without waiting for the trailer/video to finish
      // uploading — large files are handed off to the background upload manager below
      // and attached to the movie once done, so the admin isn't stuck on this page.
      const createPayload: CreateMovieData = {
        content_type: values.uploadType === 'series' ? 'series' : 'movie',
        title: values.title,
        description: values.description,
        release_date: `${values.releaseYear}-01-01`,
        base_price: Number(values.price),
        price_per_episode: values.episodePrice ? Number(values.episodePrice) : undefined,
        language: values.language,
        country: '',
        video_quality: qualityToApi[values.quality] ?? 'hd',
        movie_type: values.accessType[0] ?? 'free',
        keywords: values.keywords.join(','),
        movie_status: values.status === 'publish' ? 'published' : values.status,
        status: 1,
        author_ids: values.authors,
        genre_ids: values.genre,
        seasons: seasonsPayload,
      };
      const created = await movieService.createMovie(createPayload);

      if (files.poster || files.cover) {
        await movieService.uploadMedia(created.global_id, {
          poster_file: files.poster ?? undefined,
          cover_file: files.cover ?? undefined,
        });
      }

      if (files.trailer) startBackgroundUpload(created.global_id, 'trailer', files.trailer);
      if (files.video) startBackgroundUpload(created.global_id, 'movie', files.video);

      showToast(
        files.trailer || files.video
          ? 'Movie created — video is uploading in the background, check the Movies list for progress'
          : 'Movie created successfully!',
        'success'
      );
      navigate('/movies');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to create movie', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MovieForm
      title="Add New Movie"
      subtitle="Create a new movie entry with all details"
      submitLabel="Create Movie"
      submittingLabel="Creating..."
      isSubmitting={isSubmitting}
      onCancel={() => navigate('/movies')}
      onSubmit={handleSubmit}
      showToast={showToast}
    />
  );
};

export default AddMovie;
