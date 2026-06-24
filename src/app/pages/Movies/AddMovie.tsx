import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useNotification } from '../../context/NotificationContext';
import MovieForm, { MovieFormValues, MovieFormFiles } from '../../components/moviesform/MovieForm';
import { movieService } from '../../../api/services/movieService';

const qualityToApi: Record<string, string> = {
  FHD: 'full_hd',
  HD: 'hd',
  SD: 'hd',
};

const AddMovie = () => {
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: MovieFormValues, files: MovieFormFiles) => {
    setIsSubmitting(true);
    try {
      const created = await movieService.createMovie({
        content_type: values.uploadType === 'series' ? 'series' : 'movie',
        title: values.title,
        description: values.description,
        release_date: `${values.releaseYear}-01-01`,
        base_price: Number(values.price),
        language: values.language,
        country: '',
        video_quality: qualityToApi[values.quality] ?? 'hd',
        movie_type: values.accessType[0] ?? 'free',
        keywords: values.keywords.join(','),
        movie_status: values.status === 'publish' ? 'published' : values.status,
        status: 1,
        author_ids: [],
        genre_ids: [],
      });

      await movieService.uploadFiles(created.global_id, {
        poster_file: files.poster ?? undefined,
        cover_file: files.cover ?? undefined,
        trailer_file: files.trailer ?? undefined,
        movie_file: files.video ?? undefined,
      });

      showToast('Movie created successfully!', 'success');
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
