import { useEffect, useRef, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';

export interface StatusFilterOption {
  value: string;
  label: string;
}

interface StatusFilterDropdownProps {
  label: string;
  allLabel: string;
  options: StatusFilterOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

const StatusFilterDropdown = ({ label, allLabel, options, selectedValue, onSelect }: StatusFilterDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative w-full sm:w-auto" ref={containerRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
          selectedValue
            ? 'bg-[#6C5CE7]/10 border-[#6C5CE7]/40 text-[#6C5CE7]'
            : 'bg-[#18181b] border-[#27272a] text-[#a1a1aa] hover:text-white hover:border-[#3f3f46]'
        }`}
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span>{label}</span>
        {selectedValue && <span className="w-1.5 h-1.5 rounded-full bg-[#6C5CE7]" />}
        <svg className="w-3 h-3 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute z-20 top-full mt-2 left-0 min-w-[160px] bg-[#18181b] border border-[#27272a] rounded-xl shadow-2xl overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
            <button
              onClick={() => {
                onSelect('');
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                !selectedValue ? 'text-[#6C5CE7] bg-[#6C5CE7]/5 font-medium' : 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]'
              }`}
            >
              {allLabel}
            </button>
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onSelect(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  selectedValue === opt.value
                    ? 'text-[#6C5CE7] bg-[#6C5CE7]/5 font-medium'
                    : 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusFilterDropdown;
