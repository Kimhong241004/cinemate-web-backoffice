import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Search, Plus, SlidersHorizontal, Eye, Edit, Trash2, X, Film } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { movieService, MovieFromApi, GenreFromApi } from '../../api/services/movieService';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import Pagination from '../components/shared/Pagination';

const TAKE = 10;

const qualityLabel = (q: string) => {
  if (q === 'four_k') return '4K';
  if (q === 'full_hd') return 'FHD';
  return 'HD';
};

const formatDuration = (min: number | null) => {
  if (!min) return '—';
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

// ── badge colour maps (no borders — matches Author/UserManagement pattern) ───
const qualityColors: Record<string, string> = {
  '4K':  'bg-[#a855f7]/20 text-[#a855f7]',
  'FHD': 'bg-[#3b82f6]/20 text-[#3b82f6]',
  'HD':  'bg-[#27272a] text-[#a1a1aa]',
};

const typeColors: Record<string, string> = {
  series: 'bg-[#f97316]/20 text-[#f97316]',
  movie:  'bg-[#27272a] text-[#a1a1aa]',
};

const statusStyles: Record<string, string> = {
  published:   'bg-[#22c55e]/20 text-[#22c55e]',
  draft:       'bg-[#f97316]/20 text-[#f97316]',
  unpublished: 'bg-[#ef4444]/20 text-[#ef4444]',
};

// matches the inline-flex pattern used in Author & UserManagement
const Badge = ({ label, cls }: { label: string; cls: string }) => (
  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${cls}`}>
    {label}
  </span>
);

// ── filter dropdown ──────────────────────────────────────────────────────────
const FilterDropdown = ({
  label, active, open, onToggle, children,
}: {
  label: string; active: boolean; open: boolean;
  onToggle: (e: React.MouseEvent) => void; children: React.ReactNode;
}) => (
  <div className="relative">
    <button
      onClick={onToggle}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
        active
          ? 'bg-[#ef4444]/10 border-[#ef4444]/40 text-[#ef4444]'
          : 'bg-[#18181b] border-[#27272a] text-[#a1a1aa] hover:text-white hover:border-[#3f3f46]'
      }`}
    >
      <SlidersHorizontal className="w-3.5 h-3.5" />
      <span>{label}</span>
      {active && <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />}
      <svg className="w-3 h-3 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    {open && (
      <div className="absolute z-20 top-full mt-2 left-0 min-w-[160px] bg-[#18181b] border border-[#27272a] rounded-xl shadow-2xl overflow-hidden">
        {children}
      </div>
    )}
  </div>
);

const FilterItem = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
      active ? 'text-[#ef4444] bg-[#ef4444]/5 font-medium' : 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]'
    }`}
  >
    {label}
  </button>
);

// ── main component ───────────────────────────────────────────────────────────
const Movies = () => {
  const navigate = useNavigate();
  const { showToast, addNotification } = useNotification();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const [selectedType, setSelectedType] = useState('');
  const [selectedGenre, setSelectedGenre] = useState(''); // genre slug
  const [selectedQuality, setSelectedQuality] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [openFilter, setOpenFilter] = useState<string | null>(null);

  const [viewMovie, setViewMovie] = useState<MovieFromApi | null>(null);
  const [deleteMovie, setDeleteMovie] = useState<MovieFromApi | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [movies, setMovies] = useState<MovieFromApi[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [genres, setGenres] = useState<GenreFromApi[]>([]);

  const totalPages = Math.max(1, Math.ceil(total / TAKE));

  useEffect(() => {
    movieService.getGenres({ take: 100 }).then((res) => setGenres(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { setCurrentPage(1); setDebouncedSearch(searchQuery); }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const params: Parameters<typeof movieService.getMovies>[0] = {
      skip: (currentPage - 1) * TAKE, take: TAKE,
    };
    if (debouncedSearch) params.search = debouncedSearch;
    if (selectedType) params.content_type = selectedType === 'full' ? 'movie' : 'series';
    if (selectedStatus) params.movie_status = selectedStatus === 'publish' ? 'published' : (selectedStatus as 'draft' | 'unpublished');
    if (selectedGenre) params.genre = selectedGenre;

    movieService.getMovies(params)
      .then((res) => { if (!cancelled) { setMovies(res.data); setTotal(res.total); } })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to fetch movies'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [currentPage, debouncedSearch, selectedType, selectedStatus, selectedGenre, refreshKey]);

  // Quality is not an API param — filter client-side within the current page
  const filteredMovies = selectedQuality
    ? movies.filter((m) => qualityLabel(m.video_quality) === selectedQuality)
    : movies;

  const handleDeleteConfirm = async () => {
    if (!deleteMovie) return;
    setDeleting(true);
    try {
      await movieService.deleteMovie(deleteMovie.global_id);
      showToast(`Movie "${deleteMovie.title}" deleted successfully`, 'success');
      addNotification('Movie Deleted', `"${deleteMovie.title}" has been removed from the library`, 'success');
      setDeleteMovie(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete movie', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // close all dropdowns on outside click
  useEffect(() => {
    if (!openFilter) return;
    const close = () => setOpenFilter(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [openFilter]);

  const toggleFilter = (name: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenFilter((prev) => (prev === name ? null : name));
  };

  const typeOptions = [{ value: 'full', label: t.movies.fullMovie }, { value: 'series', label: t.movies.series }];
  const qualityOptions = ['FHD', 'HD', '4K'];
  const statusOptions = [
    { value: 'publish', label: t.movies.publish },
    { value: 'draft', label: t.movies.draft },
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
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#ef4444] to-[#f97316] rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          {t.movies.addMovie}
        </button>
      </div>

      {/* ── Search & Filters ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b]" />
          <input
            type="text"
            placeholder={t.movies.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#18181b] text-white placeholder:text-[#52525b] pl-10 pr-4 py-2.5 rounded-xl border border-[#27272a] focus:outline-none focus:border-[#3f3f46] transition-colors text-sm"
          />
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Type */}
          <FilterDropdown label={t.movies.type} active={!!selectedType} open={openFilter === 'type'} onToggle={toggleFilter('type')}>
            <FilterItem label={t.movies.allTypes} active={!selectedType} onClick={() => { setSelectedType(''); setCurrentPage(1); setOpenFilter(null); }} />
            {typeOptions.map((o) => (
              <FilterItem key={o.value} label={o.label} active={selectedType === o.value}
                onClick={() => { setSelectedType(o.value); setCurrentPage(1); setOpenFilter(null); }} />
            ))}
          </FilterDropdown>

          {/* Genre */}
          <FilterDropdown label={t.movies.genreType} active={!!selectedGenre} open={openFilter === 'genre'} onToggle={toggleFilter('genre')}>
            <div className="max-h-52 overflow-y-auto">
              <FilterItem label={t.movies.allGenres} active={!selectedGenre} onClick={() => { setSelectedGenre(''); setCurrentPage(1); setOpenFilter(null); }} />
              {genres.map((g) => (
                <FilterItem key={g.global_id} label={g.name} active={selectedGenre === g.slug}
                  onClick={() => { setSelectedGenre(g.slug); setCurrentPage(1); setOpenFilter(null); }} />
              ))}
            </div>
          </FilterDropdown>

          {/* Quality */}
          <FilterDropdown label={t.movies.filmType} active={!!selectedQuality} open={openFilter === 'quality'} onToggle={toggleFilter('quality')}>
            <FilterItem label={t.movies.allQualities} active={!selectedQuality} onClick={() => { setSelectedQuality(''); setOpenFilter(null); }} />
            {qualityOptions.map((q) => (
              <FilterItem key={q} label={q} active={selectedQuality === q}
                onClick={() => { setSelectedQuality(q); setOpenFilter(null); }} />
            ))}
          </FilterDropdown>

          {/* Status */}
          <FilterDropdown label={t.movies.status} active={!!selectedStatus} open={openFilter === 'status'} onToggle={toggleFilter('status')}>
            <FilterItem label={t.movies.allStatus} active={!selectedStatus} onClick={() => { setSelectedStatus(''); setCurrentPage(1); setOpenFilter(null); }} />
            {statusOptions.map((o) => (
              <FilterItem key={o.value} label={o.label} active={selectedStatus === o.value}
                onClick={() => { setSelectedStatus(o.value); setCurrentPage(1); setOpenFilter(null); }} />
            ))}
          </FilterDropdown>

          {/* Clear all */}
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
      <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#27272a] bg-[#0a0a0a]">
              <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">{t.movies.number}</th>
              <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">{t.movies.image}</th>
              <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">{t.movies.columnTitle}</th>
              <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">{t.movies.language}</th>
              <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">{t.movies.quality}</th>
              <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">{t.movies.genreType}</th>
              <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">{t.movies.price}</th>
              <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">{t.movies.subscriptionType}</th>
              <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">{t.movies.status}</th>
              <th className="px-4 py-4 text-center text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">{t.movies.actions}</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#27272a]">
            {loading ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-[#ef4444] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[#71717a] text-sm">Loading...</p>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-[#ef4444] text-sm">{error}</p>
                    <button onClick={() => setRefreshKey((k) => k + 1)}
                      className="px-4 py-2 bg-[#27272a] text-white text-sm rounded-lg hover:bg-[#3f3f46] transition-colors">
                      Retry
                    </button>
                  </div>
                </td>
              </tr>
            ) : filteredMovies.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center">
                  <Film className="w-10 h-10 text-[#3f3f46] mx-auto mb-3" />
                  <p className="text-[#71717a] text-sm">{t.movies.noMoviesFound}</p>
                </td>
              </tr>
            ) : (
              filteredMovies.map((movie, index) => (
                <tr key={movie.global_id} className="hover:bg-[rgba(255,255,255,0.03)] transition-colors">

                  {/* # */}
                  <td className="px-4 py-3.5 text-white text-sm whitespace-nowrap">
                    {(currentPage - 1) * TAKE + index + 1}
                  </td>

                  {/* Images */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
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
                  </td>

                  {/* Title */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <p className="text-white text-sm font-semibold">{movie.title}</p>
                    <p className="text-[#71717a] text-xs mt-0.5">{movie.release_date || '—'}</p>
                    <p className="text-[#52525b] text-xs mt-0.5">{movie.total_views.toLocaleString()} {t.movies.viewers}</p>
                  </td>

                  {/* Language */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <p className="text-white text-sm">{movie.language}</p>
                    <p className="text-[#71717a] text-xs mt-0.5">{formatDuration(movie.duration)}</p>
                  </td>

                  {/* Quality */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <Badge label={qualityLabel(movie.video_quality)} cls={qualityColors[qualityLabel(movie.video_quality)] ?? qualityColors['HD']} />
                  </td>

                  {/* Genre */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {movie.genres.length > 0
                        ? movie.genres.slice(0, 2).map((g) => (
                            <span key={g.id} className="inline-flex px-2.5 py-1 rounded-full bg-[#27272a] text-xs text-[#a1a1aa]">
                              {g.name}
                            </span>
                          ))
                        : <span className="text-xs text-[#52525b]">—</span>
                      }
                      {movie.genres.length > 2 && (
                        <span className="inline-flex px-2.5 py-1 rounded-full bg-[#27272a] text-xs text-[#52525b]">
                          +{movie.genres.length - 2}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <p className="text-white text-sm font-medium">{movie.base_price.toLocaleString()} ៛</p>
                    <p className="text-[#71717a] text-xs mt-0.5">{movie.total_revenue.toLocaleString()} ៛</p>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <Badge
                      label={movie.content_type === 'series' ? t.movies.series : t.movies.fullMovie}
                      cls={typeColors[movie.content_type] ?? typeColors['movie']}
                    />
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <Badge
                      label={movie.movie_status === 'published' ? t.movies.publish : movie.movie_status === 'draft' ? t.movies.draft : t.movies.unpublished}
                      cls={statusStyles[movie.movie_status] ?? statusStyles['unpublished']}
                    />
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => setViewMovie(movie)} className="p-2 rounded-lg hover:bg-[#27272a] transition-colors" title="View">
                        <Eye className="w-4 h-4 text-[#f97316]" />
                      </button>
                      <button onClick={() => navigate(`/movies/edit/${movie.global_id}`)} className="p-2 rounded-lg hover:bg-[#27272a] transition-colors" title="Edit">
                        <Edit className="w-4 h-4 text-[#3b82f6]" />
                      </button>
                      <button onClick={() => setDeleteMovie(movie)} className="p-2 rounded-lg hover:bg-[#27272a] transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4 text-[#ef4444]" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272a]">
              <h2 className="text-white text-lg font-bold">{t.movies.movieDetails}</h2>
              <button onClick={() => setViewMovie(null)} className="p-2 rounded-lg text-[#71717a] hover:text-white hover:bg-[#27272a] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Images */}
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

              {/* Title + badges */}
              <div className="space-y-2">
                <h3 className="text-white text-xl font-bold">{viewMovie.title}</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge label={viewMovie.movie_status === 'published' ? t.movies.publish : viewMovie.movie_status === 'draft' ? t.movies.draft : t.movies.unpublished}
                    cls={statusStyles[viewMovie.movie_status] ?? statusStyles['unpublished']} />
                  <Badge label={viewMovie.content_type === 'movie' ? t.movies.fullMovie : t.movies.series}
                    cls={typeColors[viewMovie.content_type] ?? typeColors['movie']} />
                  <Badge label={qualityLabel(viewMovie.video_quality)}
                    cls={qualityColors[qualityLabel(viewMovie.video_quality)] ?? qualityColors['HD']} />
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {[
                  { label: t.movies.releaseDate, value: viewMovie.release_date || '—' },
                  { label: t.movies.language, value: viewMovie.language },
                  { label: t.movies.duration, value: formatDuration(viewMovie.duration) },
                  { label: 'Country', value: viewMovie.country },
                  { label: t.movies.price, value: `${viewMovie.base_price.toLocaleString()} ៛` },
                  { label: t.movies.revenue, value: `${viewMovie.total_revenue.toLocaleString()} ៛` },
                  { label: t.movies.viewers, value: viewMovie.total_views.toLocaleString() },
                  { label: 'Keywords', value: viewMovie.keywords || '—' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-[#71717a] font-medium mb-1">{label}</p>
                    <p className="text-sm text-white">{value}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              {viewMovie.description && (
                <div>
                  <p className="text-xs text-[#71717a] font-medium mb-2">Description</p>
                  <p className="text-sm text-[#a1a1aa] leading-relaxed">{viewMovie.description}</p>
                </div>
              )}

              {/* Genres */}
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

              {/* Footer actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#27272a]">
                <button onClick={() => setViewMovie(null)}
                  className="px-4 py-2 rounded-xl bg-[#27272a] text-white text-sm font-medium hover:bg-[#3f3f46] transition-colors">
                  {t.common.close}
                </button>
                <button onClick={() => { setViewMovie(null); navigate(`/movies/edit/${viewMovie.global_id}`); }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ef4444] to-[#f97316] text-white text-sm font-semibold hover:opacity-90 transition-opacity">
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
