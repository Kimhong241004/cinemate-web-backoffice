import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

interface SelectFieldProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
}

const SelectField = ({ options, value, onChange, label, placeholder = 'Select...', error }: SelectFieldProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectOption = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {label && <label className="block text-white text-sm font-medium mb-2">{label}</label>}

      <button
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
        className={`w-full flex items-center justify-between gap-2 bg-[#0a0a0a] px-4 py-2.5 border text-left transition-colors duration-150 ${
          isOpen ? 'border-[#3f3f46] rounded-t-lg rounded-b-none' : `rounded-lg ${error ? 'border-[#ef4444]' : 'border-[#27272a]'}`
        }`}
      >
        <span className={`text-sm truncate ${value ? 'text-white' : 'text-[#52525b]'}`}>{value || placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-[#52525b] flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {mounted && (
        <div
          className={`absolute z-10 w-full bg-[#18181b] border border-t-0 border-[#3f3f46] rounded-b-lg shadow-lg max-h-56 overflow-y-auto origin-top transition-all duration-150 ease-out ${
            isOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-95 pointer-events-none'
          }`}
        >
          {options.map((option) => {
            const selected = option === value;
            return (
              <button
                key={option}
                type="button"
                aria-pressed={selected}
                onClick={() => selectOption(option)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors ${
                  selected ? 'bg-[#27272a] text-white font-medium' : 'text-[#a1a1aa] hover:bg-[#27272a] hover:text-white'
                }`}
              >
                {option}
                {selected && <Check className="w-4 h-4 text-[#6C5CE7]" />}
              </button>
            );
          })}
        </div>
      )}

      {error && <p className="text-[#ef4444] text-xs mt-1">{error}</p>}
    </div>
  );
};

export default SelectField;
