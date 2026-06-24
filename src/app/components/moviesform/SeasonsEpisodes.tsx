import { Plus, Play, Upload, X } from 'lucide-react';
import { Episode, Season } from '../../../types/movie';

interface SeasonsEpisodesProps {
  seasons: Season[];
  onAddSeason: () => void;
  onRemoveSeason: (seasonId: number) => void;
  onAddEpisode: (seasonId: number) => void;
  onRemoveEpisode: (seasonId: number, episodeId: number) => void;
  onEpisodeThumbnailChange: (seasonId: number, episodeId: number, e: React.ChangeEvent<HTMLInputElement>) => void;
  onEpisodeVideoChange: (seasonId: number, episodeId: number, e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpdateEpisodeField: (seasonId: number, episodeId: number, field: keyof Episode, value: any) => void;
}

const SeasonsEpisodes = ({
  seasons, onAddSeason, onRemoveSeason, onAddEpisode, onRemoveEpisode,
  onEpisodeThumbnailChange, onEpisodeVideoChange, onUpdateEpisodeField,
}: SeasonsEpisodesProps) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <label className="text-white text-sm font-medium">
        វគ្គ (Seasons & Episodes)
      </label>
      <button
        type="button"
        onClick={onAddSeason}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
      >
        <Plus className="w-4 h-4" />
        Add Season
      </button>
    </div>

    {seasons.length === 0 ? (
      <div className="border-2 border-dashed border-[#27272a] rounded-xl p-8 text-center">
        <p className="text-[#71717a] text-sm">No seasons added yet. Click "Add Season" to start.</p>
      </div>
    ) : (
      <div className="space-y-6">
        {seasons.map((season) => (
          <div key={season.id} className="border border-[#27272a] rounded-xl p-4 bg-[#0a0a0a]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-white font-medium">Season {season.seasonNumber}</h3>
                <button
                  type="button"
                  onClick={() => onAddEpisode(season.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ef4444] rounded-lg text-white text-xs font-medium hover:bg-[#dc2626] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => onRemoveSeason(season.id)}
                className="p-1.5 rounded-lg bg-[#27272a] text-[#71717a] hover:bg-[#ef4444] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {season.episodes.length === 0 ? (
              <div className="border border-[#27272a] rounded-lg p-6 text-center">
                <p className="text-[#71717a] text-sm">No episodes yet. Click + to add episode.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {season.episodes.map((episode, index) => (
                  <div key={episode.id} className="border border-[#27272a] rounded-lg p-4 bg-[#18181b]">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 text-white font-medium w-8">{index + 1}</div>

                      <div className="flex-shrink-0">
                        <div
                          onClick={() => document.getElementById(`episode-thumb-${season.id}-${episode.id}`)?.click()}
                          className="w-20 h-20 bg-[#27272a] rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center"
                        >
                          {episode.thumbnailPreview ? (
                            <img src={episode.thumbnailPreview} alt="Episode" className="w-full h-full object-cover" />
                          ) : (
                            <Upload className="w-6 h-6 text-[#71717a]" />
                          )}
                        </div>
                        <input
                          id={`episode-thumb-${season.id}-${episode.id}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => onEpisodeThumbnailChange(season.id, episode.id, e)}
                          className="hidden"
                        />
                      </div>

                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <button
                            type="button"
                            onClick={() => document.getElementById(`episode-video-${season.id}-${episode.id}`)?.click()}
                            className="w-full px-3 py-2 bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] rounded-lg text-white text-xs font-medium hover:opacity-90 transition-opacity"
                          >
                            {episode.videoFile ? 'Change Video' : 'អាប់ឡូត'}
                          </button>
                          <input
                            id={`episode-video-${season.id}-${episode.id}`}
                            type="file"
                            accept="video/*"
                            onChange={(e) => onEpisodeVideoChange(season.id, episode.id, e)}
                            className="hidden"
                          />
                          {episode.videoFile && <p className="text-[#22c55e] text-xs mt-1 truncate">{episode.videoFile.name}</p>}
                        </div>

                        <div>
                          <input
                            type="text"
                            value={episode.platform}
                            onChange={(e) => onUpdateEpisodeField(season.id, episode.id, 'platform', e.target.value)}
                            placeholder="បណ្តាញ"
                            className="w-full bg-[#0a0a0a] text-white placeholder:text-[#52525b] px-3 py-2 rounded-lg border border-[#27272a] focus:outline-none focus:border-[#3f3f46] transition-colors text-xs"
                          />
                        </div>

                        <div>
                          <input
                            type="date"
                            value={episode.releaseDate}
                            onChange={(e) => onUpdateEpisodeField(season.id, episode.id, 'releaseDate', e.target.value)}
                            className="w-full bg-[#0a0a0a] text-white px-3 py-2 rounded-lg border border-[#27272a] focus:outline-none focus:border-[#3f3f46] transition-colors text-xs"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveEpisode(season.id, episode.id)}
                        className="flex-shrink-0 p-2 rounded-lg bg-[#ef4444] text-white hover:bg-[#dc2626] transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {episode.videoPreview && (
                      <div className="mt-3 border border-[#27272a] rounded-lg overflow-hidden">
                        <div className="p-2 bg-[#0a0a0a] border-b border-[#27272a] flex items-center gap-2">
                          <Play className="w-3.5 h-3.5 text-[#22c55e]" />
                          <span className="text-white text-xs font-medium">Preview</span>
                        </div>
                        <video src={episode.videoPreview} controls className="w-full" style={{ maxHeight: '200px' }}>
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);

export default SeasonsEpisodes;
