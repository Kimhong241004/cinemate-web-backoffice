import { Check, Search, X } from 'lucide-react';
import { Author } from '../../../types/movie';

interface AuthorsSelectorProps {
  selectedAuthors: Author[];
  filteredAuthors: Author[];
  selectedAuthorIds: number[];
  authorSearch: string;
  showDropdown: boolean;
  onSearchChange: (value: string) => void;
  onFocus: () => void;
  onSelectAuthor: (authorId: number) => void;
  onRemoveAuthor: (authorId: number) => void;
}

const AuthorsSelector = ({
  selectedAuthors, filteredAuthors, selectedAuthorIds, authorSearch, showDropdown,
  onSearchChange, onFocus, onSelectAuthor, onRemoveAuthor,
}: AuthorsSelectorProps) => (
  <div className="relative">
    <label className="block text-white text-sm font-medium mb-2">
      តួអង្គ (Cast/Authors)
    </label>

    {selectedAuthors.length > 0 && (
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedAuthors.map((author) => (
          <span key={author.id} className="inline-flex items-center gap-2 pl-1 pr-3 py-1 bg-[#3b82f6] text-white text-sm rounded-lg">
            <img src={author.profile} alt={author.name} className="w-6 h-6 rounded-full object-cover" />
            {author.name}
            <button type="button" onClick={() => onRemoveAuthor(author.id)} className="hover:text-[#ef4444] transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
      </div>
    )}

    <div className="relative">
      <input
        type="text"
        value={authorSearch}
        onChange={(e) => onSearchChange(e.target.value)}
        onFocus={onFocus}
        className="w-full bg-[#0a0a0a] text-white placeholder:text-[#52525b] pl-10 pr-4 py-2.5 rounded-lg border border-[#27272a] focus:outline-none focus:border-[#3f3f46] transition-colors text-sm"
        placeholder="Search authors..."
      />
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b]" />
    </div>

    {showDropdown && authorSearch && (
      <div className="absolute z-10 w-full mt-1 bg-[#18181b] border border-[#27272a] rounded-lg shadow-lg max-h-48 overflow-y-auto">
        {filteredAuthors.length > 0 ? (
          filteredAuthors.map((author) => (
            <button
              key={author.id}
              type="button"
              onClick={() => onSelectAuthor(author.id)}
              className={`w-full text-left px-4 py-2.5 hover:bg-[#27272a] transition-colors ${
                selectedAuthorIds.includes(author.id) ? 'bg-[#27272a] text-[#3b82f6]' : 'text-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img src={author.profile} alt={author.name} className="w-8 h-8 rounded-full object-cover" />
                  <span className="text-sm">{author.name}</span>
                </div>
                {selectedAuthorIds.includes(author.id) && <Check className="w-4 h-4" />}
              </div>
            </button>
          ))
        ) : (
          <div className="px-4 py-3 text-[#71717a] text-sm">No authors found</div>
        )}
      </div>
    )}
  </div>
);

export default AuthorsSelector;
