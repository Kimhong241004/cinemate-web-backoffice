import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface GenreComboboxProps {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
  error?: string;
  placeholder?: string;
}

const GenreCombobox = ({
  options,
  value,
  onChange,
  label,
  error,
  placeholder,
}: GenreComboboxProps) => {
  const { t } = useLanguage();
  const resolvedLabel = label ?? `${t.movies.form.genre} *`;
  const resolvedPlaceholder = placeholder ?? t.movies.form.selectGenres;
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      return;
    }
    if (mounted) {
      const timeout = setTimeout(() => setMounted(false), 150);
      return () => clearTimeout(timeout);
    }
  }, [isOpen, mounted]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter((option) => option.toLowerCase().includes(search.toLowerCase()));

  const toggleOption = (option: string) => {
    onChange(value.includes(option) ? value.filter((v) => v !== option) : [...value, option]);
  };

  const removeOption = (option: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    onChange(value.filter((v) => v !== option));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearch('');
      inputRef.current?.blur();
    } else if (e.key === 'Backspace' && search === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {resolvedLabel && <label className="block text-white text-sm font-medium mb-2">{resolvedLabel}</label>}

      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
        className={`w-full bg-[#0a0a0a] flex items-center gap-2 px-4 py-2.5 border cursor-text transition-colors duration-150 ${
          isOpen ? 'border-[#3f3f46] rounded-t-lg rounded-b-none' : `rounded-lg ${error ? 'border-[#ef4444]' : 'border-[#27272a]'}`
        }`}
      >
        <div className="flex-1 flex flex-wrap items-center gap-1.5">
          {value.map((genre) => (
            <span
              key={genre}
              className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-md text-xs font-medium bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] text-white"
            >
              {genre}
              <button
                type="button"
                aria-label={`Remove ${genre}`}
                onClick={(e) => removeOption(genre, e)}
                className="hover:text-white/70 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? resolvedPlaceholder : ''}
            className="flex-1 min-w-[100px] bg-transparent text-white placeholder:text-[#52525b] focus:outline-none text-sm"
          />
        </div>
        <ChevronDown className={`w-4 h-4 text-[#52525b] flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {mounted && (
        <div
          className={`absolute z-10 w-full bg-[#18181b] border border-t-0 border-[#3f3f46] rounded-b-lg shadow-lg max-h-56 overflow-y-auto p-2 origin-top transition-all duration-150 ease-out ${
            isOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-95 pointer-events-none'
          }`}
        >
          {filteredOptions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {filteredOptions.map((option) => {
                const selected = value.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleOption(option)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selected
                        ? 'bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] text-white'
                        : 'bg-[#27272a] border border-[#27272a] text-[#71717a] hover:bg-[#3f3f46]'
                    }`}
                  >
                    {selected && <Check className="w-3.5 h-3.5" />}
                    {option}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-[#71717a] text-sm text-center py-3">{t.movies.form.noGenresMatch}</p>
          )}
        </div>
      )}

      {error && <p className="text-[#ef4444] text-xs mt-1">{error}</p>}
      <p className="text-[#71717a] text-xs mt-1">{t.movies.form.genreHint}</p>
    </div>
  );
};

export default GenreCombobox;
