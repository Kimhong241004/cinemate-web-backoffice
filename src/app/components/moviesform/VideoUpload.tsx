import { RefObject } from 'react';
import { Film, Play, Upload, X } from 'lucide-react';

interface VideoUploadProps {
  label: string;
  uploadText: string;
  file: File | null;
  preview: string;
  previewLabel: string;
  iconColorClass: string;
  inputRef: RefObject<HTMLInputElement>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  maxPreviewHeight?: string;
}

const VideoUpload = ({
  label, uploadText, file, preview, previewLabel, iconColorClass, inputRef, onChange, onRemove, maxPreviewHeight = '300px',
}: VideoUploadProps) => (
  <div>
    <label className="block text-white text-sm font-medium mb-2">{label}</label>
    <div
      onClick={() => inputRef.current?.click()}
      className="relative border-2 border-dashed border-[#27272a] rounded-xl p-6 cursor-pointer hover:border-[#3f3f46] transition-colors"
    >
      {file ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Film className={`w-8 h-8 ${iconColorClass}`} />
            <div>
              <p className="text-white text-sm font-medium">{file.name}</p>
              <p className="text-[#71717a] text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-1.5 rounded-lg bg-[#ef4444] text-white hover:bg-[#dc2626] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center">
          <Upload className="w-10 h-10 text-[#71717a] mb-2" />
          <p className="text-white text-sm font-medium">{uploadText}</p>
          <p className="text-[#71717a] text-xs mt-1">Click to browse or drag and drop</p>
        </div>
      )}
    </div>
    <input ref={inputRef} type="file" accept="video/*" onChange={onChange} className="hidden" />
    {preview && (
      <div className="mt-3 border border-[#27272a] rounded-xl overflow-hidden bg-[#0a0a0a]">
        <div className="p-3 bg-[#18181b] border-b border-[#27272a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Play className={`w-4 h-4 ${iconColorClass}`} />
            <span className="text-white text-sm font-medium">{previewLabel}</span>
          </div>
        </div>
        <video src={preview} controls className="w-full" style={{ maxHeight: maxPreviewHeight }}>
          Your browser does not support the video tag.
        </video>
      </div>
    )}
  </div>
);

export default VideoUpload;
