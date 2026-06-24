type AccessType = 'buy' | 'membership' | 'free';

const accessTypeOptions: { value: AccessType; label: string }[] = [
  { value: 'buy', label: 'Buy' },
  { value: 'membership', label: 'Membership' },
  { value: 'free', label: 'Free' },
];

interface AccessTypeSelectorProps {
  accessType: AccessType[];
  freeEpisodeCount: string;
  onToggle: (type: AccessType) => void;
  onFreeEpisodeCountChange: (value: string) => void;
}

const AccessTypeSelector = ({ accessType, freeEpisodeCount, onToggle, onFreeEpisodeCountChange }: AccessTypeSelectorProps) => (
  <div>
    <label className="block text-white text-sm font-medium mb-2">
      ប្រភេទចូលប្រើ (Access Type) *
    </label>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {accessTypeOptions.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onToggle(opt.value)}
          className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            accessType.includes(opt.value) ? 'bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] text-white' : 'bg-[#27272a] text-[#71717a] hover:bg-[#3f3f46]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>

    {accessType.includes('free') && (
      <div className="mt-3 max-w-xs">
        <label className="block text-white text-sm font-medium mb-2">
          ចំនួនភាគឥតគិតថ្លៃ (Free Episodes)
        </label>
        <input
          type="number"
          value={freeEpisodeCount}
          onChange={(e) => onFreeEpisodeCountChange(e.target.value)}
          className="w-full bg-[#0a0a0a] text-white placeholder:text-[#52525b] px-4 py-2.5 rounded-lg border border-[#27272a] focus:outline-none focus:border-[#3f3f46] transition-colors text-sm"
          placeholder="e.g. 3"
          min="0"
        />
        <p className="text-[#71717a] text-xs mt-1">Number of first episodes that are free to watch</p>
      </div>
    )}
  </div>
);

export default AccessTypeSelector;
