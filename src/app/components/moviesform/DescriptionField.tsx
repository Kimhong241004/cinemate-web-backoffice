interface DescriptionFieldProps {
  description: string;
  error: string;
  onChange: (value: string) => void;
}

const DescriptionField = ({ description, error, onChange }: DescriptionFieldProps) => (
  <div>
    <label className="block text-white text-sm font-medium mb-2">
      ការពិពណ៌នា (Description) *
    </label>
    <textarea
      value={description}
      onChange={(e) => onChange(e.target.value)}
      rows={5}
      className={`w-full bg-[#0a0a0a] text-white placeholder:text-[#52525b] px-4 py-2.5 rounded-lg border ${
        error ? 'border-[#ef4444]' : 'border-[#27272a]'
      } focus:outline-none focus:border-[#3f3f46] transition-colors text-sm resize-none`}
      placeholder="Enter movie story and description..."
    />
    {error && <p className="text-[#ef4444] text-xs mt-1">{error}</p>}
  </div>
);

export default DescriptionField;
