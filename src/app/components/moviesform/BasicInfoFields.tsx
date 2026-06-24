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
}: BasicInfoFieldsProps) => (
  <div>
    <h2 className="text-white text-base sm:text-lg font-bold mb-3 sm:mb-4">ព័ត៌មានមូលដ្ឋាន (Basic Information)</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2">
        <label className="block text-white text-sm font-medium mb-2">
          ចំណងជើងភាពយន្ត (Movie Title) *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className={`w-full bg-[#0a0a0a] text-white placeholder:text-[#52525b] px-4 py-2.5 rounded-lg border ${
            errors.title ? 'border-[#ef4444]' : 'border-[#27272a]'
          } focus:outline-none focus:border-[#3f3f46] transition-colors text-sm`}
          placeholder="Enter movie title"
        />
        {errors.title && <p className="text-[#ef4444] text-xs mt-1">{errors.title}</p>}
      </div>

      <div className="sm:col-span-2">
        <label className="block text-white text-sm font-medium mb-2">
          ឆ្នាំចេញផ្សាយ (Release Year) *
        </label>
        <select
          value={releaseYear}
          onChange={(e) => onReleaseYearChange(e.target.value)}
          className={`w-full bg-[#0a0a0a] text-white px-4 py-2.5 rounded-lg border ${
            errors.releaseYear ? 'border-[#ef4444]' : 'border-[#27272a]'
          } focus:outline-none focus:border-[#3f3f46] transition-colors text-sm`}
        >
          <option value="">Select year</option>
          {yearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
        </select>
        {errors.releaseYear && <p className="text-[#ef4444] text-xs mt-1">{errors.releaseYear}</p>}
      </div>

      <div className="sm:col-span-2">
        {uploadType === 'series' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                តម្លៃសម្រាប់ស៊េរីទាំងអស់ (Full Series Price) *
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
                តម្លៃក្នុងមួយភាគ (Price per Episode)
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
              តម្លៃសម្រាប់ទិញ (Price) *
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

export default BasicInfoFields;
