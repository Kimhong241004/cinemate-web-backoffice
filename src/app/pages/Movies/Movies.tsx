import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Search, Plus, Eye, Edit, Trash2, X, Film, Star, Play, Clock, EyeOff } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import { usePageParam } from '../../hooks/usePageParam';
import { useUploadManager, BackgroundUpload } from '../../context/UploadManagerContext';
import { movieService, MovieFromApi, GenreFromApi, MovieSource, MovieSeason, MovieEpisode } from '../../../api/services/movieService';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import Pagination from '../../components/shared/Pagination';
import StatusFilterDropdown from '../../components/shared/FilterDropdown/StatusFilterDropdown';
import { TableContainer, TableHead, Th, TableBody, TableRow, Td } from '../../components/shared/Table/Table';
import { getVideoStatusDisplay, getUploadStatusDisplay, isTerminalConvertStatus, VideoStatusDisplay } from '../../utils/videoStatus';

// A series has no single video — each episode has its own movie_url/convert_status —
// so roll all episodes up into one badge per column instead of picking just the first.
const aggregateEpisodeStatus = (episodes: MovieEpisode[]): { upload: VideoStatusDisplay | null; convert: VideoStatusDisplay | null } => {
  if (episodes.length === 0) return { upload: null, convert: null };

  const uploadedCount = episodes.filter((e) => e.movie_url).length;
  const upload = uploadedCount === 0
    ? null
    : uploadedCount === episodes.length
      ? getUploadStatusDisplay('completed')
      : { ...(getUploadStatusDisplay('pending') as VideoStatusDisplay), label: `Uploaded ${uploadedCount}/${episodes.length}` };

  const convertStatuses = episodes.map((e) => e.convert_status).filter(Boolean);
  let convert: VideoStatusDisplay | null = null;
  if (convertStatuses.length > 0) {
    const failedCount = convertStatuses.filter((s) => getVideoStatusDisplay(s)?.label === 'Failed').length;
    const completedCount = convertStatuses.filter((s) => isTerminalConvertStatus(s) && getVideoStatusDisplay(s)?.label === 'Completed').length;
    if (failedCount > 0) {
      convert = { ...(getVideoStatusDisplay('failed') as VideoStatusDisplay), label: `Failed ${failedCount}/${episodes.length}` };
    } else if (completedCount === episodes.length) {
      convert = getVideoStatusDisplay('completed');
    } else {
      convert = { ...(getVideoStatusDisplay('processing') as VideoStatusDisplay), label: `Processing ${completedCount}/${episodes.length}` };
    }
  }

  return { upload, convert };
};

const TAKE = 10;

// ── helpers ──────────────────────────────────────────────────────────────────
const qualityLabel = (q: string) => {
  if (q === 'four_k') return '4K';
  if (q === 'full_hd') return 'FHD';
  return 'HD';
};

const formatDuration = (min: number | null) => {
  if (!min) return '0 min';
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

// ── badge colour maps ────────────────────────────────────────────────────────
const qualityColors: Record<string, string> = {
  '4K':  'bg-[#a855f7]/20 text-[#a855f7]',
  'FHD': 'bg-[#3b82f6]/20 text-[#3b82f6]',
  'HD':  'bg-[#27272a] text-[#a1a1aa]',
};

const accessTypeColors: Record<string, string> = {
  membership: 'bg-[#3b82f6]/20 text-[#3b82f6]',
  buy:        'bg-[#f97316]/20 text-[#f97316]',
  free:       'bg-[#22c55e]/20 text-[#22c55e]',
};

const statusStyles: Record<string, string> = {
  published:   'bg-[#22c55e]/20 text-[#22c55e]',
  draft:       'bg-[#f97316]/20 text-[#f97316]',
  unpublished: 'bg-[#ef4444]/20 text-[#ef4444]',
};

// Background-upload phases shown on a row while a large trailer/movie file is
// still being sent to storage (before the movie's own convert_status kicks in).
const uploadPhaseLabel: Record<BackgroundUpload['status'], string> = {
  uploading:  'Uploading',
  finalizing: 'Finalizing',
  attaching:  'Attaching',
  converting: 'Converting',
  completed:  'Completed',
  error:      'Upload failed',
};

const Badge = ({ label, cls }: { label: string; cls: string }) => (
  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${cls}`}>
    {label}
  </span>
);

// ── main component ───────────────────────────────────────────────────────────
const Movies = () => {
  const navigate = useNavigate();
  const { showToast, addNotification } = useNotification();
  const { t } = useLanguage();
  const { uploads, getUploadsForMovie, dismissUpload } = useUploadManager();

  const [searchQuery, setSearchQuery]         = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage]         = usePageParam();

  const [selectedType,    setSelectedType]    = useState('');
  const [selectedGenre,   setSelectedGenre]   = useState('');
  const [selectedQuality, setSelectedQuality] = useState('');
  const [selectedStatus,  setSelectedStatus]  = useState('');

  const [viewMovie,   setViewMovie]   = useState<MovieFromApi | null>(null);
  const [deleteMovie, setDeleteMovie] = useState<MovieFromApi | null>(null);
  const [deleting,    setDeleting]    = useState(false);

  const [movies, setMovies] = useState<MovieFromApi[]>([]);
  const [total, setTotal]   = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [genres, setGenres] = useState<GenreFromApi[]>([]);
  const [stats, setStats]   = useState({ total: 0, published: 0, draft: 0, unpublished: 0 });

  // GET /v1/movies (list) never includes `sources`/`seasons`, only GET /v1/movies/{id}
  // (detail) does — so upload/convert status has to be fetched per row via the detail
  // endpoint. `sources` backs the status columns for a full movie; `seasons` (with each
  // episode's own movie_url/convert_status) backs them for a series.
  const [sourcesByMovieId, setSourcesByMovieId] = useState<Record<string, MovieSource[]>>({});
  const [seasonsByMovieId, setSeasonsByMovieId] = useState<Record<string, MovieSeason[]>>({});
  const requestedSourceIdsRef = useRef<Set<string>>(new Set());

  // Debounce search input so we don't hit the API on every keystroke.
  // Skipped when searchQuery already matches debouncedSearch (e.g. on mount) so
  // it doesn't clobber a page number restored from navigation state.
  useEffect(() => {
    if (searchQuery === debouncedSearch) return;
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearch]);

  const fetchMovies = useCallback(async () => {
    setIsLoading(true);
    try {
      const contentType = selectedType === 'full' ? 'movie' : selectedType === 'series' ? 'series' : undefined;
      const movieStatus = selectedStatus === 'publish' ? 'published'
        : selectedStatus === 'draft' ? 'draft'
        : selectedStatus === 'unpublished' ? 'unpublished'
        : undefined;
      const res = await movieService.getMovies({
        skip: (currentPage - 1) * TAKE,
        take: TAKE,
        search: debouncedSearch || undefined,
        content_type: contentType,
        movie_status: movieStatus,
        genre: selectedGenre || undefined,
      });
      setMovies(res.data);
      setTotal(res.total);
    } catch {
      showToast('Failed to load movies', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, selectedType, selectedStatus, selectedGenre, showToast]);

  useEffect(() => { fetchMovies(); }, [fetchMovies]);

  // Fetch each visible row's sources via the detail endpoint (the list endpoint never
  // includes them) the first time we see that movie on this page.
  useEffect(() => {
    const idsToFetch = movies
      .map((m) => m.global_id)
      .filter((id) => !requestedSourceIdsRef.current.has(id));
    if (idsToFetch.length === 0) return;
    idsToFetch.forEach((id) => {
      requestedSourceIdsRef.current.add(id);
      movieService.getMovie(id)
        .then((detail) => {
          setSourcesByMovieId((prev) => ({ ...prev, [id]: detail.sources ?? [] }));
          setSeasonsByMovieId((prev) => ({ ...prev, [id]: detail.seasons ?? [] }));
        })
        .catch(() => requestedSourceIdsRef.current.delete(id)); // allow retry on next pass
    });
  }, [movies]);

  // When a background upload for a movie on this page fails, surface the error
  // and drop it from the row immediately.
  useEffect(() => {
    const errored = uploads.filter((u) => u.status === 'error');
    if (errored.length === 0) return;
    errored.forEach((u) => {
      showToast(`Upload failed for ${u.fileName}: ${u.error}`, 'error');
      dismissUpload(u.id);
    });
    fetchMovies();
  }, [uploads, dismissUpload, fetchMovies, showToast]);

  // When a background upload completes, refresh the list so the real convert_status
  // is fetched, but keep the "Completed" row visible for a moment before dismissing it —
  // otherwise it flips from "Converting" straight to gone/refetched and the admin never
  // sees confirmation the upload actually finished. The scheduled-ids ref keeps this from
  // re-arming the timer every time an unrelated upload's progress ticks (uploads is a new
  // array reference on every progress update).
  const scheduledDismissRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const completed = uploads.filter((u) => u.status === 'completed' && !scheduledDismissRef.current.has(u.id));
    if (completed.length === 0) return;
    completed.forEach((u) => scheduledDismissRef.current.add(u.id));
    fetchMovies();
    completed.forEach((u) => {
      setTimeout(() => {
        dismissUpload(u.id);
        scheduledDismissRef.current.delete(u.id);
      }, 2500);
    });
  }, [uploads, dismissUpload, fetchMovies]);

  useEffect(() => {
    movieService.getGenres({ take: 100 }).then((res) => setGenres(res.data)).catch(() => {});
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const [all, published, draft, unpublished] = await Promise.all([
        movieService.getMovies({ take: 1 }),
        movieService.getMovies({ take: 1, movie_status: 'published' }),
        movieService.getMovies({ take: 1, movie_status: 'draft' }),
        movieService.getMovies({ take: 1, movie_status: 'unpublished' }),
      ]);
      setStats({ total: all.total, published: published.total, draft: draft.total, unpublished: unpublished.total });
    } catch {
      // keep previous stats on failure
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Quality has no server-side filter param — applied client-side on the current page
  const displayedMovies = selectedQuality
    ? movies.filter((m) => qualityLabel(m.video_quality) === selectedQuality)
    : movies;

  const totalPages = Math.max(1, Math.ceil(total / TAKE));

  const handleDeleteConfirm = async () => {
    if (!deleteMovie) return;
    setDeleting(true);
    try {
      await movieService.deleteMovie(deleteMovie.global_id);
      showToast(`Movie "${deleteMovie.title}" deleted successfully`, 'success');
      addNotification('Movie Deleted', `"${deleteMovie.title}" has been removed from the library`, 'success');
      setDeleteMovie(null);
      fetchMovies();
      fetchStats();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to delete movie', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const typeOptions    = [{ value: 'full', label: t.movies.fullMovie }, { value: 'series', label: t.movies.series }];
  const qualityOptions = ['FHD', 'HD', '4K'];
  const statusOptions  = [
    { value: 'publish',     label: t.movies.publish     },
    { value: 'draft',       label: t.movies.draft       },
    { value: 'unpublished', label: t.movies.unpublished },
  ];
  return (
    <div className="space-y-5">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl font-bold">{t.movies.title}</h1>
          <p className="text-[#71717a] text-sm mt-0.5">{t.movies.subtitle}</p>
        </div>
        <button
          onClick={() => navigate('/movies/add')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          {t.movies.addMovie}
        </button>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────────── */}
      {(() => {
        const cards = [
          { label: 'Total Movies',  value: stats.total,       icon: <Film  className="w-5 h-5 text-[#f97316]" />, iconBg: 'bg-[#f97316]/10' },
          { label: 'Published',     value: stats.published,   icon: <Play  className="w-5 h-5 text-[#22c55e]" />, iconBg: 'bg-[#22c55e]/10' },
          { label: 'Draft',         value: stats.draft,       icon: <Clock className="w-5 h-5 text-[#eab308]" />, iconBg: 'bg-[#eab308]/10' },
          { label: 'Unpublished',   value: stats.unpublished, icon: <EyeOff className="w-5 h-5 text-[#ef4444]" />, iconBg: 'bg-[#ef4444]/10' },
        ];
        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {cards.map((card) => (
              <div key={card.label} className="bg-[#18181b] border border-[#27272a] rounded-2xl px-5 py-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${card.iconBg}`}>
                  {card.icon}
                </div>
                <div>
                  <p className="text-white text-xl font-bold leading-none">{card.value}</p>
                  <p className="text-[#71717a] text-sm mt-1">{card.label}</p>
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* ── Search & Filters ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b]" />
          <input
            type="text"
            placeholder={t.movies.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full bg-[#18181b] text-white placeholder:text-[#52525b] pl-10 pr-4 py-2.5 rounded-xl border border-[#27272a] focus:outline-none focus:border-[#3f3f46] transition-colors text-sm"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Type */}
          <StatusFilterDropdown
            label={t.movies.type}
            allLabel={t.movies.allTypes}
            selectedValue={selectedType}
            onSelect={(v) => { setSelectedType(v); setCurrentPage(1); }}
            options={typeOptions}
          />

          {/* Genre */}
          <StatusFilterDropdown
            label={t.movies.genreType}
            allLabel={t.movies.allGenres}
            selectedValue={selectedGenre}
            onSelect={(v) => { setSelectedGenre(v); setCurrentPage(1); }}
            options={genres.map((g) => ({ value: g.slug, label: g.name }))}
          />

          {/* Quality */}
          <StatusFilterDropdown
            label={t.movies.filmType}
            allLabel={t.movies.allQualities}
            selectedValue={selectedQuality}
            onSelect={setSelectedQuality}
            options={qualityOptions.map((q) => ({ value: q, label: q }))}
          />

          {/* Status */}
          <StatusFilterDropdown
            label={t.movies.status}
            allLabel={t.movies.allStatus}
            selectedValue={selectedStatus}
            onSelect={(v) => { setSelectedStatus(v); setCurrentPage(1); }}
            options={statusOptions}
          />

          {(selectedType || selectedGenre || selectedQuality || selectedStatus) && (
            <button
              onClick={() => { setSelectedType(''); setSelectedGenre(''); setSelectedQuality(''); setSelectedStatus(''); setCurrentPage(1); }}
              className="px-3 py-2 text-xs text-[#71717a] hover:text-white transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <TableContainer>
        <TableHead>
          <Th>{t.movies.number}</Th>
          <Th>{t.movies.image}</Th>
          <Th>{t.movies.columnTitle}</Th>
          <Th>{t.movies.language}</Th>
          <Th>{t.movies.genreType}</Th>
          <Th>{t.movies.quality}</Th>
          <Th>Rental Price</Th>
          <Th>Total Revenue</Th>
          <Th>Access Type</Th>
          <Th>{t.movies.status}</Th>
          <Th>Upload Status</Th>
          <Th>Converting Status</Th>
          <Th align="center">{t.movies.actions}</Th>
        </TableHead>

        <TableBody>
          {isLoading ? (
            <tr>
              <td colSpan={13} className="px-4 py-12 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-[#ef4444] border-t-transparent rounded-full animate-spin" />
                  <p className="text-[#71717a] text-sm">Loading...</p>
                </div>
              </td>
            </tr>
          ) : displayedMovies.length === 0 ? (
            <tr>
              <td colSpan={13} className="px-4 py-12 text-center">
                <Film className="w-10 h-10 text-[#3f3f46] mx-auto mb-3" />
                <p className="text-[#71717a] text-sm">{t.movies.noMoviesFound}</p>
              </td>
            </tr>
          ) : (
            displayedMovies.map((movie, index) => {
              const ql         = qualityLabel(movie.video_quality);
              const isSeries   = movie.content_type === 'series';
              const src0       = sourcesByMovieId[movie.global_id]?.[0];
              const episodes   = isSeries ? (seasonsByMovieId[movie.global_id] ?? []).flatMap((s) => s.episodes) : [];
              const episodeAgg = isSeries ? aggregateEpisodeStatus(episodes) : null;
              const vidStatus  = isSeries ? episodeAgg!.convert : getVideoStatusDisplay(src0?.convert_status);
              const accessType = movie.movie_type?.toLowerCase() ?? 'free';
              const movieUploads     = getUploadsForMovie(movie.global_id);
              const activeUpload     = movieUploads.find((u) => u.target === 'movie' && u.status !== 'error')
                ?? movieUploads.find((u) => u.target === 'trailer' && u.status !== 'error');
              const convertingStatus = activeUpload?.status === 'converting'
                ? getVideoStatusDisplay(activeUpload.convertStatus) ?? { dot: 'bg-[#eab308]', badgeCls: 'bg-[#eab308]/20 text-[#eab308]', label: 'Converting', terminal: false }
                : null;
              // File-transfer progress, independent of transcoding. The API doesn't expose
              // upload_global_id on sources (only the standalone upload-status endpoint does,
              // and that's only reachable while we still hold the id from an in-session
              // upload), so for rows uploaded elsewhere (e.g. Swagger) the presence of
              // movie_url is the only signal we have that the file finished transferring.
              // Series content has no `sources` at all — its upload state is rolled up
              // per-episode from `seasons` instead (aggregateEpisodeStatus above).
              const uploadStatusDisplay = activeUpload
                ? null
                : isSeries
                  ? episodeAgg!.upload
                  : src0
                    ? getUploadStatusDisplay(src0.movie_url ? 'completed' : 'pending')
                    : null;

              return (
                <TableRow key={movie.global_id}>

                  {/* # */}
                  <Td>{(currentPage - 1) * TAKE + index + 1}</Td>

                  {/* Images */}
                  <Td>
                    <div className="flex items-center gap-1.5">
                      <div className="w-9 h-12 rounded-md overflow-hidden bg-[#27272a] flex-shrink-0">
                        {movie.poster_url
                          ? <img src={movie.poster_url} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"><Film className="w-3.5 h-3.5 text-[#52525b]" /></div>
                        }
                      </div>
                      <div className="w-16 h-12 rounded-md overflow-hidden bg-[#27272a] flex-shrink-0">
                        {movie.cover_url
                          ? <img src={movie.cover_url} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"><Film className="w-3.5 h-3.5 text-[#52525b]" /></div>
                        }
                      </div>
                    </div>
                  </Td>

                  {/* Title */}
                  <Td>
                    <div className="max-w-[220px] whitespace-normal">
                      <p className="text-white text-sm font-semibold flex items-center gap-1.5">
                        <span className="line-clamp-2">{movie.title}</span>
                        {movie.is_highlight && <Star className="w-3.5 h-3.5 flex-shrink-0 fill-[#eab308] text-[#eab308]" />}
                      </p>
                      <p className="text-[#71717a] text-xs mt-0.5">{movie.release_date || '—'}</p>
                      <p className="text-[#52525b] text-xs mt-0.5">{movie.total_views.toLocaleString()} {t.movies.viewers}</p>
                    </div>
                  </Td>

                  {/* Language */}
                  <Td>
                    <p className="text-white text-sm">{movie.language}</p>
                    <p className="text-[#71717a] text-xs mt-0.5">{formatDuration(movie.duration)}</p>
                  </Td>

                  {/* Genre */}
                  <Td>
                    <div className="flex flex-wrap gap-1 max-w-[160px]">
                      {movie.genres.length > 0
                        ? movie.genres.map((g) => (
                            <Badge key={g.global_id} label={g.name} cls="bg-[#27272a] text-[#a1a1aa]" />
                          ))
                        : <span className="text-[#52525b] text-sm">—</span>
                      }
                    </div>
                  </Td>

                  {/* Quality */}
                  <Td>
                    <Badge label={ql} cls={qualityColors[ql] ?? qualityColors['HD']} />
                  </Td>

                  {/* Rental Price */}
                  <Td className="font-medium">{movie.base_price.toLocaleString()} ៛</Td>

                  {/* Total Revenue */}
                  <Td className={`font-medium ${movie.total_revenue > 0 ? 'text-[#22c55e]' : 'text-[#71717a]'}`}>
                    {movie.total_revenue.toLocaleString()} ៛
                  </Td>

                  {/* Access Type */}
                  <Td>
                    <Badge
                      label={accessType.charAt(0).toUpperCase() + accessType.slice(1)}
                      cls={accessTypeColors[accessType] ?? accessTypeColors['free']}
                    />
                  </Td>

                  {/* Status */}
                  <Td>
                    <Badge
                      label={movie.movie_status === 'published' ? t.movies.publish : movie.movie_status === 'draft' ? t.movies.draft : t.movies.unpublished}
                      cls={statusStyles[movie.movie_status] ?? statusStyles['unpublished']}
                    />
                  </Td>

                  {/* Upload Status — file transfer, not transcoding */}
                  <Td>
                    {activeUpload ? (
                      <div className="w-32">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-medium ${activeUpload.status === 'completed' || activeUpload.status === 'converting' ? 'text-[#22c55e]' : 'text-[#3b82f6]'}`}>
                            {activeUpload.status === 'converting' ? 'Completed' : uploadPhaseLabel[activeUpload.status]}
                          </span>
                          <span className={`text-xs font-semibold ${activeUpload.status === 'completed' || activeUpload.status === 'converting' ? 'text-[#22c55e]' : 'text-[#3b82f6]'}`}>
                            {activeUpload.status === 'converting' ? 100 : Math.min(activeUpload.progress, 100)}%
                          </span>
                        </div>
                        <div className={`w-full h-2 rounded-full overflow-hidden ${activeUpload.status === 'completed' || activeUpload.status === 'converting' ? 'bg-[#22c55e]/20' : 'bg-[#3b82f6]/20'}`}>
                          <div
                            className={`h-full rounded-full transition-all ${activeUpload.status === 'completed' || activeUpload.status === 'converting' ? 'bg-[#22c55e]' : 'bg-[#3b82f6]'}`}
                            style={{ width: `${activeUpload.status === 'converting' ? 100 : Math.min(activeUpload.progress, 100)}%` }}
                          />
                        </div>
                      </div>
                    ) : uploadStatusDisplay ? (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${uploadStatusDisplay.badgeCls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${uploadStatusDisplay.dot}`} />
                        {uploadStatusDisplay.label}
                      </span>
                    ) : (
                      <span className="text-[#52525b] text-sm">—</span>
                    )}
                  </Td>

                  {/* Converting Status — transcoding, independent of upload */}
                  <Td>
                    {convertingStatus ? (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${convertingStatus.badgeCls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${convertingStatus.dot} animate-pulse`} />
                        {convertingStatus.label}
                      </span>
                    ) : vidStatus ? (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${vidStatus.badgeCls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${vidStatus.dot}`} />
                        {vidStatus.label}
                      </span>
                    ) : (
                      <span className="text-[#52525b] text-sm">—</span>
                    )}
                  </Td>

                  {/* Actions */}
                  <Td align="center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => setViewMovie(movie)} className="p-2 rounded-lg hover:bg-[#27272a] transition-colors" title="View">
                        <Eye className="w-4 h-4 text-[#6C5CE7]" />
                      </button>
                      <button
                        className="p-2 rounded-lg hover:bg-[#27272a] transition-colors"
                        title={movie.is_highlight ? 'Highlighted' : 'Highlight'}
                      >
                        <Star className={`w-4 h-4 ${movie.is_highlight ? 'fill-[#eab308] text-[#eab308]' : 'text-[#52525b]'}`} />
                      </button>
                      <button onClick={() => navigate(`/movies/edit/${movie.global_id}?page=${currentPage}`)} className="p-2 rounded-lg hover:bg-[#27272a] transition-colors" title="Edit">
                        <Edit className="w-4 h-4 text-[#3b82f6]" />
                      </button>
                      <button onClick={() => setDeleteMovie(movie)} className="p-2 rounded-lg hover:bg-[#27272a] transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4 text-[#ef4444]" />
                      </button>
                    </div>
                  </Td>

                </TableRow>
              );
            })
          )}
        </TableBody>
      </TableContainer>

      {/* ── Pagination ──────────────────────────────────────────────────── */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        summary={<>{t.movies.showing} {total > 0 ? (currentPage - 1) * TAKE + 1 : 0} {t.movies.to} {Math.min(currentPage * TAKE, total)} {t.movies.of} {total} {t.movies.entries}</>}
      />

      {/* ── View Modal ──────────────────────────────────────────────────── */}
      {viewMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272a]">
              <h2 className="text-white text-lg font-bold">{t.movies.movieDetails}</h2>
              <button onClick={() => setViewMovie(null)} className="p-2 rounded-lg text-[#71717a] hover:text-white hover:bg-[#27272a] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex gap-4">
                <div className="w-28 h-40 rounded-xl overflow-hidden bg-[#27272a] flex-shrink-0">
                  {viewMovie.poster_url
                    ? <img src={viewMovie.poster_url} alt="poster" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-xs text-[#52525b]">No poster</div>
                  }
                </div>
                <div className="flex-1 h-40 rounded-xl overflow-hidden bg-[#27272a]">
                  {viewMovie.cover_url
                    ? <img src={viewMovie.cover_url} alt="cover" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-xs text-[#52525b]">No cover</div>
                  }
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-white text-xl font-bold flex items-center gap-2">
                  {viewMovie.title}
                  {viewMovie.is_highlight && <Star className="w-5 h-5 fill-[#eab308] text-[#eab308]" />}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    label={viewMovie.movie_status === 'published' ? t.movies.publish : viewMovie.movie_status === 'draft' ? t.movies.draft : t.movies.unpublished}
                    cls={statusStyles[viewMovie.movie_status] ?? statusStyles['unpublished']}
                  />
                  <Badge
                    label={(viewMovie.movie_type ?? 'free').charAt(0).toUpperCase() + (viewMovie.movie_type ?? 'free').slice(1)}
                    cls={accessTypeColors[viewMovie.movie_type?.toLowerCase() ?? 'free'] ?? accessTypeColors['free']}
                  />
                  <Badge
                    label={qualityLabel(viewMovie.video_quality)}
                    cls={qualityColors[qualityLabel(viewMovie.video_quality)] ?? qualityColors['HD']}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {[
                  { label: t.movies.releaseDate, value: viewMovie.release_date || '—' },
                  { label: t.movies.language,    value: viewMovie.language           },
                  { label: t.movies.duration,    value: formatDuration(viewMovie.duration) },
                  { label: 'Country',            value: viewMovie.country            },
                  { label: 'Rental Price',       value: `${viewMovie.base_price.toLocaleString()} ៛` },
                  { label: 'Total Revenue',      value: `${viewMovie.total_revenue.toLocaleString()} ៛` },
                  { label: t.movies.viewers,     value: viewMovie.total_views.toLocaleString() },
                  { label: 'Keywords',           value: viewMovie.keywords || '—'   },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-[#71717a] font-medium mb-1">{label}</p>
                    <p className="text-sm text-white">{value}</p>
                  </div>
                ))}
              </div>

              {viewMovie.description && (
                <div>
                  <p className="text-xs text-[#71717a] font-medium mb-2">Description</p>
                  <p className="text-sm text-[#a1a1aa] leading-relaxed">{viewMovie.description}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-[#71717a] font-medium mb-2">{t.movies.genre}</p>
                <div className="flex flex-wrap gap-2">
                  {viewMovie.genres.length > 0
                    ? viewMovie.genres.map((g) => (
                        <span key={g.id} className="px-2.5 py-1 rounded-lg bg-[#27272a] text-xs text-[#a1a1aa]">{g.name}</span>
                      ))
                    : <span className="text-sm text-[#52525b]">—</span>
                  }
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#27272a]">
                <button onClick={() => setViewMovie(null)}
                  className="px-4 py-2 rounded-xl bg-[#27272a] text-white text-sm font-medium hover:bg-[#3f3f46] transition-colors">
                  {t.common.close}
                </button>
                <button onClick={() => { setViewMovie(null); navigate(`/movies/edit/${viewMovie.global_id}?page=${currentPage}`); }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] text-white text-sm font-semibold hover:opacity-90 transition-opacity">
                  {t.movies.editMovie}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirm ──────────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={!!deleteMovie}
        title={t.movies.deleteMovie}
        message={`${t.movies.deleteMovieConfirm} "${deleteMovie?.title}"? ${t.movies.deleteConfirmEnd}`}
        confirmLabel={t.common.delete}
        cancelLabel={t.common.cancel}
        variant="danger"
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteMovie(null)}
      />
    </div>
  );
};

export default Movies;
