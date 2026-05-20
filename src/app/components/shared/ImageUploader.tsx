import { useState, useRef } from 'react';
import { Link, Upload, X, ImageIcon } from 'lucide-react';
import { uploadService, UploadFolder } from '../../../api/services/uploadService';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  folder: UploadFolder;
  label?: string;
  required?: boolean;
  error?: string;
  accept?: string;
  previewShape?: 'square' | 'circle';
  defaultTab?: 'url' | 'device';
}

type Tab = 'url' | 'device';

const ImageUploader = ({
  value,
  onChange,
  folder,
  label,
  required = false,
  error,
  accept = 'image/*',
  previewShape = 'square',
  defaultTab = 'url',
}: ImageUploaderProps) => {
  const [tab, setTab] = useState<Tab>(defaultTab);
  const [urlInput, setUrlInput] = useState(value);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [previewBroken, setPreviewBroken] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUrlCommit = () => {
    setPreviewBroken(false);
    onChange(urlInput.trim());
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setIsUploading(true);
    try {
      const res = await uploadService.upload(file, folder);
      setPreviewBroken(false);
      onChange(res.public_url);
      setUrlInput(res.public_url);
    } catch {
      setUploadError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClear = () => {
    setUrlInput('');
    setPreviewBroken(false);
    onChange('');
  };

  const previewUrl = value || '';
  const showPreview = previewUrl && !previewBroken;
  const shapeClass = previewShape === 'circle' ? 'rounded-full' : 'rounded-lg';

  return (
    <div>
      {label && (
        <label className="block text-white text-sm font-medium mb-2">
          {label}{required && ' *'}
        </label>
      )}

      {/* Preview */}
      {showPreview && (
        <div className="relative mb-3 inline-flex">
          <img
            src={previewUrl}
            alt="Preview"
            onError={() => setPreviewBroken(true)}
            className={`w-16 h-16 object-cover border border-[#27272a] ${shapeClass}`}
          />
          <button
            type="button"
            onClick={handleClear}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#ef4444] rounded-full flex items-center justify-center hover:bg-[#dc2626] transition-colors"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      )}

      {!showPreview && (
        <div className={`w-16 h-16 mb-3 bg-[#27272a] border border-dashed border-[#3f3f46] flex items-center justify-center ${shapeClass}`}>
          <ImageIcon className="w-6 h-6 text-[#52525b]" />
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-[#0a0a0a] border border-[#27272a] rounded-lg p-1 mb-3 w-fit gap-1">
        <button
          type="button"
          onClick={() => setTab('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            tab === 'url'
              ? 'bg-[#27272a] text-white'
              : 'text-[#71717a] hover:text-white'
          }`}
        >
          <Link className="w-3.5 h-3.5" />
          URL
        </button>
        <button
          type="button"
          onClick={() => setTab('device')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            tab === 'device'
              ? 'bg-[#27272a] text-white'
              : 'text-[#71717a] hover:text-white'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          Device
        </button>
      </div>

      {/* URL input */}
      {tab === 'url' && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUrlCommit()}
            placeholder="https://example.com/image.png"
            className={`flex-1 bg-[#0a0a0a] text-white placeholder:text-[#52525b] px-3 py-2 rounded-lg border ${
              error ? 'border-[#ef4444]' : 'border-[#27272a]'
            } focus:outline-none focus:border-[#3f3f46] transition-colors text-sm`}
          />
          <button
            type="button"
            onClick={handleUrlCommit}
            className="px-3 py-2 bg-[#27272a] hover:bg-[#3f3f46] text-white text-xs font-medium rounded-lg transition-colors whitespace-nowrap"
          >
            Apply
          </button>
        </div>
      )}

      {/* Device upload */}
      {tab === 'device' && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-dashed transition-colors text-sm font-medium ${
              error
                ? 'border-[#ef4444] text-[#ef4444] hover:bg-[#ef4444]/5'
                : 'border-[#27272a] text-[#71717a] hover:border-[#3f3f46] hover:text-white hover:bg-[#27272a]/50'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isUploading ? (
              <>
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Choose file
              </>
            )}
          </button>
          {uploadError && (
            <p className="text-[#ef4444] text-xs mt-1">{uploadError}</p>
          )}
        </div>
      )}

      {error && (
        <p className="text-[#ef4444] text-xs mt-1">{error}</p>
      )}
    </div>
  );
};

export default ImageUploader;
