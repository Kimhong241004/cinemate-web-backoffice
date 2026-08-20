type AccessType = 'buy' | 'membership' | 'free';

const accessTypeOptions: { value: AccessType; label: string }[] = [
  { value: 'buy', label: 'Buy' },
  { value: 'membership', label: 'Membership' },
  { value: 'free', label: 'Free' },
];

interface AccessTypeSelectorProps {
  accessType: AccessType[];
  onToggle: (type: AccessType) => void;
}

const AccessTypeSelector = ({ accessType, onToggle }: AccessTypeSelectorProps) => (
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
  </div>
);

export default AccessTypeSelector;
