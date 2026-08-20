import { languageOptions, qualityOptions } from '../../constants/movieForm';
import SelectField from './SelectField';

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
    <SelectField
      label="ភាសា (Language) *"
      placeholder="Select language"
      options={languageOptions}
      value={language}
      onChange={onLanguageChange}
      error={languageError}
    />

    <SelectField
      label="កម្រឹតវីដេអូ (Video Quality) *"
      placeholder="Select quality"
      options={qualityOptions}
      value={quality}
      onChange={onQualityChange}
      error={qualityError}
    />
  </div>
);

export default LanguageQualityFields;
