import { RefObject, useEffect, useRef } from 'react';
import { Film, Play, Upload, X } from 'lucide-react';
import Hls from 'hls.js';
import { useLanguage } from '../../context/LanguageContext';
import { VideoUploadProgress } from '../../../types/movie';
import ConvertStatusBadge from './ConvertStatusBadge';

const uploadPhaseLabel: Partial<Record<VideoUploadProgress['status'], string>> = {
  finalizing: 'Finalizing',
  attaching:  'Attaching',
  error:      'Upload failed',
};

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
  /** Set while this file is uploading after submit. */
  upload?: VideoUploadProgress;
}

const VideoUpload = ({
  label, uploadText, file, preview, previewLabel, iconColorClass, inputRef, onChange, onRemove, maxPreviewHeight = '300px', upload,
}: VideoUploadProps) => {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !preview) return;

    // Server-side sources are HLS stream URLs (.m3u8), which no browser except
    // Safari can play via a plain <video src>; locally-selected files are blob:
    // URLs and always play natively, so only reach for hls.js when needed.
    if (preview.includes('.m3u8') && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(preview);
      hls.attachMedia(video);
      return () => hls.destroy();
    }

    video.src = preview;
    return () => {
      video.removeAttribute('src');
      video.load();
    };
  }, [preview]);

  return (
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
            <p className="text-[#71717a] text-xs mt-1">{t.movies.form.clickToBrowseVideo}</p>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="video/*" onChange={onChange} className="hidden" />
      {upload && (() => {
        // Once the file is uploaded and attached, the bar gives way to the convert
        // (transcoding) status; Pending covers the gap before the first poll returns.
        if (upload.status === 'converting' || upload.status === 'completed') {
          return <ConvertStatusBadge status={upload.status === 'completed' ? 'completed' : upload.convertStatus || 'pending'} />;
        }
        const failed = upload.status === 'error';
        const pct = Math.min(upload.progress, 100);
        const color = failed ? 'text-[#ef4444]' : 'text-[#3b82f6]';
        return (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-medium ${color}`}>
                {upload.status === 'uploading' ? t.movies.form.uploading : uploadPhaseLabel[upload.status]}
              </span>
              <span className={`text-xs font-semibold ${color}`}>{pct}%</span>
            </div>
            <div className="w-full h-2 bg-[#27272a] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${failed ? 'bg-[#ef4444]' : 'bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63]'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            {failed && upload.error && <p className="text-[#ef4444] text-xs mt-1">{upload.error}</p>}
          </div>
        );
      })()}
      {preview && (
        <div className="mt-3 border border-[#27272a] rounded-xl overflow-hidden bg-[#0a0a0a]">
          <div className="p-3 bg-[#18181b] border-b border-[#27272a] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Play className={`w-4 h-4 ${iconColorClass}`} />
              <span className="text-white text-sm font-medium">{previewLabel}</span>
            </div>
          </div>
          <video ref={videoRef} controls className="w-full" style={{ maxHeight: maxPreviewHeight }}>
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;
