import { RefObject } from 'react';
import { Upload, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface ImageDropzoneProps {
  label: string;
  uploadText: string;
  hint: string;
  preview: string;
  error: string;
  inputRef: RefObject<HTMLInputElement>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

const ImageDropzone = ({ label, uploadText, hint, preview, error, inputRef, onChange, onRemove }: ImageDropzoneProps) => (
  <div>
    <label className="block text-white text-sm font-medium mb-2">{label}</label>
    <div
      onClick={() => inputRef.current?.click()}
      className={`relative border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-colors ${
        error ? 'border-[#ef4444]' : 'border-[#27272a] hover:border-[#3f3f46]'
      } ${preview ? 'h-48' : 'h-32'}`}
    >
      {preview ? (
        <>
          <img src={preview} alt={`${label} preview`} className="w-full h-full object-cover" />
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-[#ef4444] text-white hover:bg-[#dc2626] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
          <Upload className="w-8 h-8 text-[#71717a] mb-2" />
          <p className="text-white text-sm font-medium mb-1">{uploadText}</p>
          <p className="text-[#71717a] text-xs">{hint}</p>
        </div>
      )}
    </div>
    <input ref={inputRef} type="file" accept="image/*" onChange={onChange} className="hidden" />
    {error && <p className="text-[#ef4444] text-xs mt-1">{error}</p>}
  </div>
);

interface PosterCoverUploadProps {
  posterPreview: string;
  coverPreview: string;
  posterError: string;
  coverError: string;
  posterInputRef: RefObject<HTMLInputElement>;
  coverInputRef: RefObject<HTMLInputElement>;
  onPosterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCoverChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePoster: () => void;
  onRemoveCover: () => void;
}

const PosterCoverUpload = ({
  posterPreview, coverPreview, posterError, coverError,
  posterInputRef, coverInputRef, onPosterChange, onCoverChange, onRemovePoster, onRemoveCover,
}: PosterCoverUploadProps) => {
  const { t } = useLanguage();
  return (
  <>
    <ImageDropzone
      label={`${t.movies.form.posterLabel} *`}
      uploadText={t.movies.form.uploadPoster}
      hint={t.movies.form.posterHint}
      preview={posterPreview}
      error={posterError}
      inputRef={posterInputRef}
      onChange={onPosterChange}
      onRemove={onRemovePoster}
    />
    <ImageDropzone
      label={`${t.movies.form.coverLabel} *`}
      uploadText={t.movies.form.uploadCover}
      hint={t.movies.form.coverHint}
      preview={coverPreview}
      error={coverError}
      inputRef={coverInputRef}
      onChange={onCoverChange}
      onRemove={onRemoveCover}
    />
  </>
  );
};

export default PosterCoverUpload;
