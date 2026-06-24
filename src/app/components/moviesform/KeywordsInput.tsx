import { Sparkles, X } from 'lucide-react';

interface KeywordsInputProps {
  keywords: string[];
  keywordInput: string;
  error: string;
  isGenerating: boolean;
  onInputChange: (value: string) => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onRemove: (keyword: string) => void;
  onGenerate: () => void;
}

const KeywordsInput = ({
  keywords, keywordInput, error, isGenerating, onInputChange, onKeyPress, onRemove, onGenerate,
}: KeywordsInputProps) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <label className="block text-white text-sm font-medium">
        ពាក្យគន្លឹះ (Keywords for SEO) *
      </label>
      <button
        type="button"
        onClick={onGenerate}
        disabled={isGenerating}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] rounded-lg text-white text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
        {isGenerating ? 'Generating...' : 'Generate with AI'}
      </button>
    </div>
    <div className={`w-full bg-[#0a0a0a] rounded-lg border ${error ? 'border-[#ef4444]' : 'border-[#27272a]'} p-2`}>
      <div className="flex flex-wrap gap-2 mb-2">
        {keywords.map((keyword, index) => (
          <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#27272a] text-white text-sm rounded-lg">
            {keyword}
            <button type="button" onClick={() => onRemove(keyword)} className="hover:text-[#ef4444] transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={keywordInput}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyPress={onKeyPress}
        className="w-full bg-transparent text-white placeholder:text-[#52525b] px-2 py-1 focus:outline-none text-sm"
        placeholder="Type keyword and press Enter..."
      />
    </div>
    {error && <p className="text-[#ef4444] text-xs mt-1">{error}</p>}
    <p className="text-[#71717a] text-xs mt-1">Press Enter to add keywords or use AI to generate (e.g., action, thriller, khmer)</p>
  </div>
);

export default KeywordsInput;
