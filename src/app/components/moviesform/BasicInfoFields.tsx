import SelectField from './SelectField';
import { useLanguage } from '../../context/LanguageContext';

interface BasicInfoFieldsProps {
  title: string;
  releaseYear: string;
  uploadType: 'full' | 'series';
  price: string;
  episodePrice: string;
  yearOptions: number[];
  errors: { title: string; releaseYear: string; price: string };
  onTitleChange: (value: string) => void;
  onReleaseYearChange: (value: string) => void;
  onPriceChange: (value: string) => void;
  onEpisodePriceChange: (value: string) => void;
}

const BasicInfoFields = ({
  title, releaseYear, uploadType, price, episodePrice, yearOptions, errors,
  onTitleChange, onReleaseYearChange, onPriceChange, onEpisodePriceChange,
}: BasicInfoFieldsProps) => {
  const { t } = useLanguage();
  return (
  <div>
    <h2 className="text-white text-base sm:text-lg font-bold mb-3 sm:mb-4">{t.movies.form.basicInfo}</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2">
        <label className="block text-white text-sm font-medium mb-2">
          {t.movies.form.movieTitleLabel} *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className={`w-full bg-[#0a0a0a] text-white placeholder:text-[#52525b] px-4 py-2.5 rounded-lg border ${
            errors.title ? 'border-[#ef4444]' : 'border-[#27272a]'
          } focus:outline-none focus:border-[#3f3f46] transition-colors text-sm`}
          placeholder={t.movies.form.movieTitlePlaceholder}
        />
        {errors.title && <p className="text-[#ef4444] text-xs mt-1">{errors.title}</p>}
      </div>

      <div className="sm:col-span-2">
        <SelectField
          label={`${t.movies.form.releaseYear} *`}
          placeholder={t.movies.form.selectYear}
          options={yearOptions.map(String)}
          value={releaseYear}
          onChange={onReleaseYearChange}
          error={errors.releaseYear}
        />
      </div>

      <div className="sm:col-span-2">
        {uploadType === 'series' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                {t.movies.form.fullSeriesPrice} *
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => onPriceChange(e.target.value)}
                className={`w-full bg-[#0a0a0a] text-white placeholder:text-[#52525b] px-4 py-2.5 rounded-lg border ${
                  errors.price ? 'border-[#ef4444]' : 'border-[#27272a]'
                } focus:outline-none focus:border-[#3f3f46] transition-colors text-sm`}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              {errors.price && <p className="text-[#ef4444] text-xs mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                {t.movies.form.pricePerEpisode}
              </label>
              <input
                type="number"
                value={episodePrice}
                onChange={(e) => onEpisodePriceChange(e.target.value)}
                className="w-full bg-[#0a0a0a] text-white placeholder:text-[#52525b] px-4 py-2.5 rounded-lg border border-[#27272a] focus:outline-none focus:border-[#3f3f46] transition-colors text-sm"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              {t.movies.form.priceLabel} *
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => onPriceChange(e.target.value)}
              className={`w-full bg-[#0a0a0a] text-white placeholder:text-[#52525b] px-4 py-2.5 rounded-lg border ${
                errors.price ? 'border-[#ef4444]' : 'border-[#27272a]'
              } focus:outline-none focus:border-[#3f3f46] transition-colors text-sm`}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
            {errors.price && <p className="text-[#ef4444] text-xs mt-1">{errors.price}</p>}
          </div>
        )}
      </div>
    </div>
  </div>
  );
};

export default BasicInfoFields;
