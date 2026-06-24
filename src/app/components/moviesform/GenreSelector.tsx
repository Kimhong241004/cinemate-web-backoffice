import { genreOptions } from '../../constants/movieForm';

interface GenreSelectorProps {
  selectedGenres: string[];
  error: string;
  onToggle: (genre: string) => void;
}

const GenreSelector = ({ selectedGenres, error, onToggle }: GenreSelectorProps) => (
  <div>
    <label className="block text-white text-sm font-medium mb-2">
      បណ្តុំរឿង (Genre) *
    </label>
    <div className="flex flex-wrap gap-2 sm:gap-3">
      {genreOptions.map((genre) => (
        <button
          key={genre}
          type="button"
          onClick={() => onToggle(genre)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            selectedGenres.includes(genre) ? 'bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] text-white' : 'bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46]'
          }`}
        >
          {genre}
        </button>
      ))}
    </div>
    {error && <p className="text-[#ef4444] text-xs mt-1">{error}</p>}
  </div>
);

export default GenreSelector;
