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
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-[#18181b] border border-[#27272a] rounded-lg text-white text-sm hover:bg-[#27272a] transition-colors"
      >
        <SlidersHorizontal className="w-4 h-4" />
        <span>{label}</span>
        {selectedValue && <span className="w-2 h-2 rounded-full bg-[#ef4444]" />}
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute z-10 mt-2 w-48 bg-[#18181b] border border-[#27272a] rounded-lg shadow-lg">
          <div className="p-2">
            <button
              onClick={() => {
                onSelect('');
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#27272a] rounded-lg transition-colors"
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
                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                  selectedValue === opt.value
                    ? 'bg-[#27272a] text-[#ef4444]'
                    : 'text-white hover:bg-[#27272a]'
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
