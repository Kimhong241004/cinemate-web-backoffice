type MovieStatus = 'draft' | 'publish' | 'unpublished';

interface StatusSelectorProps {
  status: MovieStatus;
  isFormValid: boolean;
  onChange: (status: MovieStatus) => void;
}

const StatusSelector = ({ status, isFormValid, onChange }: StatusSelectorProps) => (
  <div>
    <label className="block text-white text-sm font-medium mb-2">
      ស្ថានភាព (Movie Status)
    </label>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <button
        type="button"
        onClick={() => onChange('draft')}
        className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
          status === 'draft' ? 'bg-[#f59e0b] text-white' : 'bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46]'
        }`}
      >
        Draft
      </button>
      <button
        type="button"
        onClick={() => onChange('publish')}
        disabled={!isFormValid}
        title={!isFormValid ? 'Fill in all required fields to publish' : ''}
        className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          status === 'publish' ? 'bg-[#22c55e] text-white' : 'bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46]'
        }`}
      >
        Publish
      </button>
      <button
        type="button"
        onClick={() => onChange('unpublished')}
        className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
          status === 'unpublished' ? 'bg-[#ef4444] text-white' : 'bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46]'
        }`}
      >
        Unpublished
      </button>
    </div>
  </div>
);

export default StatusSelector;
