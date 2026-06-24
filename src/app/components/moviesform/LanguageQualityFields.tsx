import { languageOptions, qualityOptions } from '../../constants/movieForm';

interface LanguageQualityFieldsProps {
  language: string;
  quality: string;
  languageError: string;
  qualityError: string;
  onLanguageChange: (value: string) => void;
  onQualityChange: (value: string) => void;
}

const LanguageQualityFields = ({
  language, quality, languageError, qualityError, onLanguageChange, onQualityChange,
}: LanguageQualityFieldsProps) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div>
      <label className="block text-white text-sm font-medium mb-2">
        ភាសា (Language) *
      </label>
      <select
        value={language}
        onChange={(e) => onLanguageChange(e.target.value)}
        className={`w-full bg-[#0a0a0a] text-white px-4 py-2.5 rounded-lg border ${
          languageError ? 'border-[#ef4444]' : 'border-[#27272a]'
        } focus:outline-none focus:border-[#3f3f46] transition-colors text-sm`}
      >
        <option value="">Select language</option>
        {languageOptions.map((lang) => <option key={lang} value={lang}>{lang}</option>)}
      </select>
      {languageError && <p className="text-[#ef4444] text-xs mt-1">{languageError}</p>}
    </div>

    <div>
      <label className="block text-white text-sm font-medium mb-2">
        កម្រឹតវីដេអូ (Video Quality) *
      </label>
      <select
        value={quality}
        onChange={(e) => onQualityChange(e.target.value)}
        className={`w-full bg-[#0a0a0a] text-white px-4 py-2.5 rounded-lg border ${
          qualityError ? 'border-[#ef4444]' : 'border-[#27272a]'
        } focus:outline-none focus:border-[#3f3f46] transition-colors text-sm`}
      >
        <option value="">Select quality</option>
        {qualityOptions.map((q) => <option key={q} value={q}>{q}</option>)}
      </select>
      {qualityError && <p className="text-[#ef4444] text-xs mt-1">{qualityError}</p>}
    </div>
  </div>
);

export default LanguageQualityFields;
