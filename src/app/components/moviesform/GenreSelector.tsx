import { GenreFromApi } from '../../../api/services/movieService';
import GenreCombobox from './GenreCombobox';

interface GenreSelectorProps {
  genres: GenreFromApi[];
  selectedGenres: string[];
  error: string;
  onChange: (genreIds: string[]) => void;
}

const GenreSelector = ({ genres, selectedGenres, error, onChange }: GenreSelectorProps) => {
  const options = genres.map((genre) => genre.name);
  const value = genres.filter((genre) => selectedGenres.includes(genre.global_id)).map((genre) => genre.name);

  const handleChange = (names: string[]) => {
    const ids = names
      .map((name) => genres.find((genre) => genre.name === name)?.global_id)
      .filter((id): id is string => Boolean(id));
    onChange(ids);
  };

  return <GenreCombobox options={options} value={value} onChange={handleChange} error={error} />;
};

export default GenreSelector;
