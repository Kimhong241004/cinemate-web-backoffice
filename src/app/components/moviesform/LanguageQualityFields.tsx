import { countryOptions, languageOptions, qualityOptions } from '../../constants/movieForm';
import SelectField from './SelectField';
import { useLanguage } from '../../context/LanguageContext';

interface LanguageQualityFieldsProps {
  language: string;
  country: string;
  quality: string;
  languageError: string;
  countryError: string;
  qualityError: string;
  onLanguageChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onQualityChange: (value: string) => void;
}

const LanguageQualityFields = ({
  language, country, quality, languageError, countryError, qualityError, onLanguageChange, onCountryChange, onQualityChange,
}: LanguageQualityFieldsProps) => {
  const { t } = useLanguage();
  return (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <SelectField
      label={`${t.movies.form.language} *`}
      placeholder={t.movies.form.selectLanguage}
      options={languageOptions}
      value={language}
      onChange={onLanguageChange}
      error={languageError}
    />

    <SelectField
      label={`${t.movies.form.country} *`}
      placeholder={t.movies.form.selectCountry}
      options={countryOptions}
      value={country}
      onChange={onCountryChange}
      error={countryError}
    />

    <SelectField
      label={`${t.movies.form.videoQuality} *`}
      placeholder={t.movies.form.selectQuality}
      options={qualityOptions}
      value={quality}
      onChange={onQualityChange}
      error={qualityError}
    />
  </div>
  );
};

export default LanguageQualityFields;
