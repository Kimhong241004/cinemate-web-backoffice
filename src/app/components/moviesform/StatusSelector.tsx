import { useLanguage } from '../../context/LanguageContext';

type MovieStatus = 'draft' | 'publish' | 'unpublished';

interface StatusSelectorProps {
  status: MovieStatus;
  isFormValid: boolean;
  onChange: (status: MovieStatus) => void;
}

const StatusSelector = ({ status, isFormValid, onChange }: StatusSelectorProps) => {
  const { t } = useLanguage();
  return (
  <div>
    <label className="block text-white text-sm font-medium mb-2">
      {t.movies.form.movieStatus}
    </label>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <button
        type="button"
        onClick={() => onChange('draft')}
        className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
          status === 'draft' ? 'bg-[#f59e0b] text-white' : 'bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46]'
        }`}
      >
        {t.movies.form.statusDraft}
      </button>
      <button
        type="button"
        onClick={() => onChange('publish')}
        disabled={!isFormValid}
        title={!isFormValid ? t.movies.form.publishDisabledHint : ''}
        className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          status === 'publish' ? 'bg-[#22c55e] text-white' : 'bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46]'
        }`}
      >
        {t.movies.form.statusPublish}
      </button>
      <button
        type="button"
        onClick={() => onChange('unpublished')}
        className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
          status === 'unpublished' ? 'bg-[#ef4444] text-white' : 'bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46]'
        }`}
      >
        {t.movies.form.statusUnpublished}
      </button>
    </div>
  </div>
  );
};

export default StatusSelector;
