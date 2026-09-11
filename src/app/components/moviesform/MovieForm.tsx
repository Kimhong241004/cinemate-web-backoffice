import { useMovieForm } from '../../hooks/useMovieForm';
import { useLanguage } from '../../context/LanguageContext';
import { MovieFormProps } from '../../../types/movie';
import SliderUpload from './SliderUpload';
import PosterCoverUpload from './PosterCoverUpload';
import UploadTypeToggle from './UploadTypeToggle';
import BasicInfoFields from './BasicInfoFields';
import GenreSelector from './GenreSelector';
import LanguageQualityFields from './LanguageQualityFields';
import DescriptionField from './DescriptionField';
import KeywordsInput from './KeywordsInput';
import AuthorsSelector from './AuthorsSelector';
import VideoUpload from './VideoUpload';
import SeasonsEpisodes from './SeasonsEpisodes';
import AccessTypeSelector from './AccessTypeSelector';
import StatusSelector from './StatusSelector';

export type { MovieFormValues, MovieFormFiles } from '../../../types/movie';

const MovieForm = ({
  title,
  subtitle,
  submitLabel,
  submittingLabel,
  isSubmitting,
  initialValues,
  initialPreviews,
  initialSeasons,
  onCancel,
  onSubmit,
  showToast,
}: MovieFormProps) => {
  const form = useMovieForm({ initialValues, initialPreviews, initialSeasons, showToast, onSubmit });
  const { t } = useLanguage();

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 py-3">
        <button
          onClick={onCancel}
          className="p-2 rounded-lg bg-[#18181b] border border-[#27272a] text-white hover:bg-[#27272a] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-white text-xl sm:text-2xl lg:text-3xl font-bold mb-1">{title}</h1>
          <p className="text-[#71717a] text-sm">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={form.handleSubmit}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex-shrink-0"
        >
          {isSubmitting ? submittingLabel : submitLabel}
        </button>
      </div>

      {/* Form */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Images Section */}
        <div>
          <h2 className="text-white text-base sm:text-lg font-bold mb-3 sm:mb-4">{t.movies.form.imagesSection}</h2>

          <SliderUpload
            sliders={form.sliders}
            inputRef={form.refs.sliderInputRef}
            onFileChange={form.handleSliderFileChange}
            onRemove={form.removeSlider}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PosterCoverUpload
              posterPreview={form.previews.poster}
              coverPreview={form.previews.cover}
              posterError={form.formErrors.poster}
              coverError={form.formErrors.cover}
              posterInputRef={form.refs.posterInputRef}
              coverInputRef={form.refs.coverInputRef}
              onPosterChange={(e) => form.handleImageChange('poster', e)}
              onCoverChange={(e) => form.handleImageChange('cover', e)}
              onRemovePoster={() => form.removePosterOrCover('poster')}
              onRemoveCover={() => form.removePosterOrCover('cover')}
            />

            <UploadTypeToggle
              uploadType={form.formData.uploadType}
              onChange={(uploadType) => form.setFormData({ ...form.formData, uploadType })}
            />
          </div>
        </div>

        <BasicInfoFields
          title={form.formData.title}
          releaseYear={form.formData.releaseYear}
          uploadType={form.formData.uploadType}
          price={form.formData.price}
          episodePrice={form.formData.episodePrice}
          yearOptions={form.yearOptions}
          errors={{ title: form.formErrors.title, releaseYear: form.formErrors.releaseYear, price: form.formErrors.price }}
          onTitleChange={(title) => form.setFormData({ ...form.formData, title })}
          onReleaseYearChange={(releaseYear) => form.setFormData({ ...form.formData, releaseYear })}
          onPriceChange={(price) => form.setFormData({ ...form.formData, price })}
          onEpisodePriceChange={(episodePrice) => form.setFormData({ ...form.formData, episodePrice })}
        />

        <GenreSelector
          genres={form.genreOptions}
          selectedGenres={form.formData.genre}
          error={form.formErrors.genre}
          onChange={form.setGenre}
        />

        <LanguageQualityFields
          language={form.formData.language}
          country={form.formData.country}
          quality={form.formData.quality}
          languageError={form.formErrors.language}
          countryError={form.formErrors.country}
          qualityError={form.formErrors.quality}
          onLanguageChange={(language) => form.setFormData({ ...form.formData, language })}
          onCountryChange={(country) => form.setFormData({ ...form.formData, country })}
          onQualityChange={(quality) => form.setFormData({ ...form.formData, quality })}
        />

        <DescriptionField
          description={form.formData.description}
          error={form.formErrors.description}
          onChange={(description) => form.setFormData({ ...form.formData, description })}
        />

        <KeywordsInput
          keywords={form.formData.keywords}
          keywordInput={form.keywordInput}
          error={form.formErrors.keywords}
          isGenerating={form.isGeneratingKeywords}
          onInputChange={form.setKeywordInput}
          onKeyPress={form.handleKeywordKeyPress}
          onRemove={form.handleRemoveKeyword}
          onGenerate={form.handleGenerateKeywords}
        />

        <AuthorsSelector
          selectedAuthors={form.selectedAuthors}
          filteredAuthors={form.filteredAuthors}
          selectedAuthorIds={form.formData.authors}
          authorSearch={form.authorSearch}
          showDropdown={form.showAuthorDropdown}
          onSearchChange={form.setAuthorSearch}
          onFocus={() => form.setShowAuthorDropdown(true)}
          onSelectAuthor={form.selectAuthor}
          onRemoveAuthor={form.toggleAuthor}
        />

        {/* Video Uploads */}
        <div>
          <h2 className="text-white text-base sm:text-lg font-bold mb-3 sm:mb-4">{t.movies.form.videosSection}</h2>
          <div className="space-y-4">
            <VideoUpload
              label={t.movies.form.trailerLabel}
              uploadText={t.movies.form.uploadTrailer}
              previewLabel={t.movies.form.trailerPreview}
              iconColorClass="text-[#3b82f6]"
              file={form.files.trailer}
              preview={form.previews.trailer}
              inputRef={form.refs.trailerInputRef}
              onChange={(e) => form.handleVideoChange('trailer', e)}
              onRemove={() => form.removeVideo('trailer')}
            />

            {form.formData.uploadType === 'full' && (
              <VideoUpload
                label={t.movies.form.fullVideoLabel}
                uploadText={t.movies.form.uploadFullVideo}
                previewLabel={t.movies.form.videoPreview}
                iconColorClass="text-[#22c55e]"
                maxPreviewHeight="400px"
                file={form.files.video}
                preview={form.previews.video}
                inputRef={form.refs.videoInputRef}
                onChange={(e) => form.handleVideoChange('video', e)}
                onRemove={() => form.removeVideo('video')}
              />
            )}

            {form.formData.uploadType === 'series' && (
              <SeasonsEpisodes
                seasons={form.seasons}
                isSubmitting={isSubmitting}
                onAddSeason={form.addSeason}
                onRemoveSeason={form.removeSeason}
                onAddEpisode={form.addEpisode}
                onRemoveEpisode={form.removeEpisode}
                onEpisodeThumbnailChange={form.handleEpisodeThumbnailChange}
                onEpisodeVideoChange={form.handleEpisodeVideoChange}
                onUpdateEpisodeField={form.updateEpisodeField}
                onToggleEpisodeFree={form.toggleEpisodeFree}
                onUnlockAllEpisodes={form.unlockSeasonEpisodes}
                onLockAllEpisodes={form.lockSeasonEpisodes}
              />
            )}
          </div>
        </div>

        <AccessTypeSelector
          accessType={form.formData.accessType}
          onToggle={(type) => form.setFormData({ ...form.formData, accessType: [type] })}
        />

        <StatusSelector
          status={form.formData.status}
          isFormValid={form.isFormValid()}
          onChange={(status) => form.setFormData({ ...form.formData, status })}
        />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-[#27272a]">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#27272a] text-white text-sm font-medium hover:bg-[#3f3f46] transition-colors order-2 sm:order-1"
            disabled={isSubmitting}
          >
            {t.common.cancel}
          </button>
          <button
            type="button"
            onClick={form.handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
          >
            {isSubmitting ? submittingLabel : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieForm;
