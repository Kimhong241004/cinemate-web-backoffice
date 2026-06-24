import { RefObject } from 'react';
import { Upload, X } from 'lucide-react';
import { SliderImage } from '../../../types/movie';

interface SliderUploadProps {
  sliders: SliderImage[];
  inputRef: RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (sliderId: number) => void;
}

const SliderUpload = ({ sliders, inputRef, onFileChange, onRemove }: SliderUploadProps) => (
  <div className="mb-4">
    <label className="block text-white text-sm font-medium mb-2">
      រូបភាពស្លាយ (Slider Images)
    </label>
    {sliders.length > 0 && (
      <div className="flex flex-wrap gap-3 mb-3">
        {sliders.map((slider) => (
          <div key={slider.id} className="relative border border-[#27272a] rounded-lg overflow-hidden w-16 h-24">
            <img src={slider.preview} alt="Slider preview" className="w-full h-full object-cover" />
            <button
              onClick={() => onRemove(slider.id)}
              className="absolute top-1 right-1 p-1 rounded-md bg-[#ef4444] text-white hover:bg-[#dc2626] transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    )}
    <div
      onClick={() => inputRef.current?.click()}
      className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-[#27272a] hover:border-[#3f3f46] rounded-lg cursor-pointer transition-colors px-4 py-2.5"
    >
      <Upload className="w-4 h-4 text-[#71717a]" />
      <p className="text-white text-sm font-medium">Upload Slider</p>
    </div>
    <input ref={inputRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
  </div>
);

export default SliderUpload;
