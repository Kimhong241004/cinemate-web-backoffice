interface UploadTypeToggleProps {
  uploadType: 'full' | 'series';
  onChange: (type: 'full' | 'series') => void;
}

const UploadTypeToggle = ({ uploadType, onChange }: UploadTypeToggleProps) => (
  <div className="sm:col-span-2">
    <h2 className="text-white text-sm font-bold mb-2">ប្រភេទអាប់ឡូត (Upload Type)</h2>
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => onChange('full')}
        className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
          uploadType === 'full' ? 'bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] text-white' : 'bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46]'
        }`}
      >
        Full Movie
      </button>
      <button
        type="button"
        onClick={() => onChange('series')}
        className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
          uploadType === 'series' ? 'bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] text-white' : 'bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46]'
        }`}
      >
        Series/Episodes
      </button>
    </div>
  </div>
);

export default UploadTypeToggle;
