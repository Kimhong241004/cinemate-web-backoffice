import { useState } from 'react';
import { Search, Calendar, SlidersHorizontal, Eye, Heart, Bookmark, Share2, TrendingUp, X, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const imgUserAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=moitv';

interface Post {
  id: number;
  image: string;
  username: string;
  type: string;
  views: number;
  likes: number;
  saved: number;
  share: number;
  impressions: number;
  createDate: string;
  contentType: string;
  contentOwner: string;
  contentOwnerAvatar: string;
  contentOwnerUserId: string;
}

const ContentLibrary = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('All');
  const [selectedPosts, setSelectedPosts] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [showUnpublishModal, setShowUnpublishModal] = useState(false);
  const [showRestrictModal, setShowRestrictModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState('');
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showDateRangeModal, setShowDateRangeModal] = useState(false);
  const [selectedPostTypes, setSelectedPostTypes] = useState<string[]>([]);
  const [viewsRange, setViewsRange] = useState({ min: '', max: '' });
  const [likesRange, setLikesRange] = useState({ min: '', max: '' });
  const [dateRange, setDateRange] = useState({ start: '2026-03-07', end: '2026-04-04' });

  const tabs = ['All', 'Story', 'Explore', 'Short', 'Unpublished', 'Restricted'];

  // Mock data for posts
  const posts: Post[] = [
    {
      id: 0,
      image: imgUserAvatar,
      username: 'សូមរាយការណ៍ផ្សាយផ្ទាល់ពីសភាជាតិ Join Bo...',
      type: 'Sabayflix ទីក្រុងភ្នំពេញ • test',
      views: 0,
      likes: 2,
      saved: 0,
      share: 0,
      impressions: 32,
      createDate: '2026-04-15',
      contentType: 'Story',
      contentOwner: 'Sabayflix Official',
      contentOwnerAvatar: imgUserAvatar,
      contentOwnerUserId: 'USR-10234',
    },
    {
      id: 1,
      image: imgUserAvatar,
      username: 'សូមរាយការណ៍ផ្សាយផ្ទាល់ពីសភាជាតិ Join Bo...',
      type: 'Sabayflix ទីក្រុងភ្នំពេញ • test',
      views: 0,
      likes: 2,
      saved: 0,
      share: 0,
      impressions: 32,
      createDate: '2026-04-14',
      contentType: 'Explore',
      contentOwner: 'Content Team',
      contentOwnerAvatar: imgUserAvatar,
      contentOwnerUserId: 'USR-10567',
    },
    {
      id: 2,
      image: imgUserAvatar,
      username: 'សូមរាយការណ៍ផ្សាយផ្ទាល់ពីសភាជាតិ Join Bo...',
      type: 'Sabayflix ទីក្រុងភ្នំពេញ • test',
      views: 0,
      likes: 2,
      saved: 0,
      share: 0,
      impressions: 32,
      createDate: '2026-04-13',
      contentType: 'Short',
      contentOwner: 'Media Producer',
      contentOwnerAvatar: imgUserAvatar,
      contentOwnerUserId: 'USR-10891',
    },
    {
      id: 3,
      image: imgUserAvatar,
      username: 'សូមរាយការណ៍ផ្សាយផ្ទាល់ពីសភាជាតិ Join Bo...',
      type: 'Sabayflix ទីក្រុងភ្នំពេញ • test',
      views: 0,
      likes: 2,
      saved: 0,
      share: 0,
      impressions: 32,
      createDate: '2026-04-12',
      contentType: 'Story',
      contentOwner: 'Sabayflix Official',
      contentOwnerAvatar: imgUserAvatar,
      contentOwnerUserId: 'USR-10234',
    },
    {
      id: 4,
      image: imgUserAvatar,
      username: 'សូមរាយការណ៍ផ្សាយផ្ទាល់ពីសភាជាតិ Join Bo...',
      type: 'Sabayflix ទីក្រុងភ្នំពេញ • test',
      views: 0,
      likes: 2,
      saved: 0,
      share: 0,
      impressions: 32,
      createDate: '2026-04-11',
      contentType: 'Live',
      contentOwner: 'Live Events',
      contentOwnerAvatar: imgUserAvatar,
      contentOwnerUserId: 'USR-11023',
    },
    {
      id: 5,
      image: imgUserAvatar,
      username: 'សូមរាយការណ៍ផ្សាយផ្ទាល់ពីសភាជាតិ Join Bo...',
      type: 'Sabayflix ទីក្រុងភ្នំពេញ • test',
      views: 0,
      likes: 2,
      saved: 0,
      share: 0,
      impressions: 32,
      createDate: '2026-04-10',
      contentType: 'Explore',
      contentOwner: 'Content Team',
      contentOwnerAvatar: imgUserAvatar,
      contentOwnerUserId: 'USR-10567',
    },
    {
      id: 6,
      image: imgUserAvatar,
      username: 'សូមរាយការណ៍ផ្សាយផ្ទាល់ពីសភាជាតិ Join Bo...',
      type: 'Sabayflix ទីក្រុងភ្នំពេញ • test',
      views: 0,
      likes: 2,
      saved: 0,
      share: 0,
      impressions: 32,
      createDate: '2026-04-09',
      contentType: 'Short',
      contentOwner: 'Media Producer',
      contentOwnerAvatar: imgUserAvatar,
      contentOwnerUserId: 'USR-10891',
    },
  ];

  // Filter posts based on search and filters
  const filteredPosts = posts.filter((post) => {
    // Search filter
    if (searchQuery && !post.username.toLowerCase().includes(searchQuery.toLowerCase()) && !post.type.toLowerCase().includes(searchQuery.toLowerCase()) && !post.contentOwnerUserId.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Date range filter
    if (dateRange.start && dateRange.end) {
      const postDate = new Date(post.createDate);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      if (postDate < startDate || postDate > endDate) {
        return false;
      }
    }

    // Post type filter
    if (selectedPostTypes.length > 0 && !selectedPostTypes.includes(post.contentType)) {
      return false;
    }

    // Views range filter
    if (viewsRange.min && post.views < parseInt(viewsRange.min)) {
      return false;
    }
    if (viewsRange.max && post.views > parseInt(viewsRange.max)) {
      return false;
    }

    // Likes range filter
    if (likesRange.min && post.likes < parseInt(likesRange.min)) {
      return false;
    }
    if (likesRange.max && post.likes > parseInt(likesRange.max)) {
      return false;
    }

    return true;
  });

  const togglePostSelection = (postId: number) => {
    setSelectedPosts((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  const toggleSelectAll = () => {
    const filteredIds = filteredPosts.map((p) => p.id);
    const allFilteredSelected = filteredIds.every((id) => selectedPosts.includes(id));

    if (allFilteredSelected) {
      setSelectedPosts(selectedPosts.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedPosts([...new Set([...selectedPosts, ...filteredIds])]);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl sm:text-3xl font-bold">{t.contentLibrary.title}</h1>
        <p className="text-[#71717a] text-sm mt-1">{t.contentLibrary.subtitle}</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 border-b border-[#27272a] overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative pb-3 text-sm font-bold transition-colors whitespace-nowrap flex-shrink-0 ${
              activeTab === tab ? 'text-white' : 'text-[#71717a] hover:text-white'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{
                  background: 'linear-gradient(90deg, #ef4444 0%, #f97316 100%)',
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-0 sm:max-w-sm">
          <input
            type="text"
            placeholder="Search for posts"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#18181b] text-white placeholder:text-[#52525b] pl-4 pr-10 py-2.5 rounded-lg border border-[#27272a] focus:outline-none focus:border-[#3f3f46] transition-colors text-sm"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b]" />
        </div>

        {/* Date Range - Hidden on mobile, text shortened on tablet */}
        <button
          onClick={() => setShowDateRangeModal(true)}
          className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-[#18181b] border border-[#27272a] rounded-lg text-white text-sm hover:bg-[#27272a] transition-colors whitespace-nowrap"
        >
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span className="hidden lg:inline">
            {new Date(dateRange.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(dateRange.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          <span className="lg:hidden">Date Range</span>
        </button>

        {/* Filters */}
        <button
          onClick={() => setShowFiltersModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#18181b] border border-[#27272a] rounded-lg text-white text-sm hover:bg-[#27272a] transition-colors sm:w-auto"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>{t.contentLibrary.filter}</span>
          {(selectedPostTypes.length > 0 || viewsRange.min || viewsRange.max || likesRange.min || likesRange.max) && (
            <span className="ml-1 px-1.5 py-0.5 bg-[#f97316] text-white text-xs rounded-full">
              {selectedPostTypes.length + (viewsRange.min || viewsRange.max ? 1 : 0) + (likesRange.min || likesRange.max ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="text-[#71717a] text-sm">
          {selectedPosts.length}/{filteredPosts.length} posts selected
          {filteredPosts.length < posts.length && (
            <span className="ml-2 text-[#52525b]">({posts.length} total)</span>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 bg-[#ef4444] hover:bg-[#dc2626] text-white text-sm font-bold rounded-lg transition-colors"
            onClick={() => setShowUnpublishModal(true)}
          >
            Unpublish
          </button>
          <button
            className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 bg-[#f97316] hover:bg-[#ea580c] text-white text-sm font-bold rounded-lg transition-colors"
            onClick={() => setShowRestrictModal(true)}
          >
            Restrict
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-x-auto overflow-y-auto max-h-[600px]">
        {/* Table Header */}
        <div className="flex h-[56px] items-center border-b border-[rgba(255,255,255,0.1)] relative">
          <div className="flex items-center px-[16px] shrink-0">
            <input
              type="checkbox"
              checked={filteredPosts.length > 0 && filteredPosts.every((post) => selectedPosts.includes(post.id))}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-[rgba(255,255,255,0.2)] bg-transparent checked:bg-[#e7000b] cursor-pointer accent-[#e7000b]"
            />
          </div>
          <div className="min-w-[350px] w-[350px] px-[17px] py-[16px] shrink-0">
            <p className="text-[#71717a] text-[12px] font-bold uppercase tracking-wider" style={{ fontVariationSettings: "'wdth' 100" }}>
              Preview
            </p>
          </div>
          <div className="min-w-[120px] px-[17px] py-[16px]">
            <p className="text-[#71717a] text-[12px] font-bold uppercase tracking-wider" style={{ fontVariationSettings: "'wdth' 100" }}>
              Create Date
            </p>
          </div>
          <div className="min-w-[110px] px-[17px] py-[16px]">
            <p className="text-[#71717a] text-[12px] font-bold uppercase tracking-wider" style={{ fontVariationSettings: "'wdth' 100" }}>
              Content Type
            </p>
          </div>
          <div className="min-w-[200px] px-[17px] py-[16px]">
            <p className="text-[#71717a] text-[12px] font-bold uppercase tracking-wider" style={{ fontVariationSettings: "'wdth' 100" }}>
              Owner
            </p>
          </div>
          <div className="flex-1 px-[17px] py-[16px]">
            <div className="flex items-center gap-[5px]">
              <Eye className="w-[14px] h-[14px] text-[#71717a]" />
              <p className="text-[#71717a] text-[12px] font-bold uppercase tracking-wider" style={{ fontVariationSettings: "'wdth' 100" }}>
                Views
              </p>
            </div>
          </div>
          <div className="flex-1 px-[17px] py-[16px]">
            <div className="flex items-center gap-[5px]">
              <Heart className="w-[14px] h-[14px] text-[#71717a]" />
              <p className="text-[#71717a] text-[12px] font-bold uppercase tracking-wider" style={{ fontVariationSettings: "'wdth' 100" }}>
                Likes
              </p>
            </div>
          </div>
          <div className="flex-1 px-[17px] py-[16px]">
            <div className="flex items-center gap-[5px]">
              <Bookmark className="w-[14px] h-[14px] text-[#71717a]" />
              <p className="text-[#71717a] text-[12px] font-bold uppercase tracking-wider" style={{ fontVariationSettings: "'wdth' 100" }}>
                Saved
              </p>
            </div>
          </div>
          <div className="flex-1 px-[17px] py-[16px]">
            <div className="flex items-center gap-[5px]">
              <Share2 className="w-[14px] h-[14px] text-[#71717a]" />
              <p className="text-[#71717a] text-[12px] font-bold uppercase tracking-wider" style={{ fontVariationSettings: "'wdth' 100" }}>
                Share
              </p>
            </div>
          </div>
          <div className="flex-1 px-[17px] py-[16px]">
            <div className="flex items-center gap-[4px]">
              <TrendingUp className="w-[14px] h-[14px] text-[#71717a]" />
              <p className="text-[#71717a] text-[12px] font-bold uppercase tracking-wider" style={{ fontVariationSettings: "'wdth' 100" }}>
                Impressions
              </p>
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-[rgba(255,255,255,0.1)]">
          {filteredPosts.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-[#71717a] text-sm">No posts found matching your filters</p>
            </div>
          ) : (
            filteredPosts.map((post) => (
            <div
              key={post.id}
              className="flex h-[97px] items-center hover:bg-[rgba(255,255,255,0.02)] transition-colors relative"
            >
              {/* Checkbox */}
              <div className="flex items-center justify-center px-[16px] shrink-0">
                <input
                  type="checkbox"
                  checked={selectedPosts.includes(post.id)}
                  onChange={() => togglePostSelection(post.id)}
                  className="w-4 h-4 rounded border-[rgba(255,255,255,0.2)] bg-transparent checked:bg-[#e7000b] cursor-pointer accent-[#e7000b]"
                />
              </div>

              {/* Preview */}
              <div className="flex flex-col items-start min-w-[350px] w-[350px] py-[17px] shrink-0">
                <div className="flex gap-[12px] items-center w-full h-[64px]">
                  <div className="relative rounded-[14px] shrink-0 w-[64px] h-[64px]">
                    <img
                      src={post.image}
                      alt={post.username}
                      className="absolute inset-0 w-full h-full object-cover rounded-[14px]"
                    />
                  </div>
                  <div className="flex-1 min-w-0 h-[36px]">
                    <div className="flex flex-col items-start">
                      <div className="h-[20px] overflow-hidden w-full">
                        <p className="font-['Open_Sans','Noto_Sans_Khmer',sans-serif] font-bold leading-[20px] text-[14px] text-white whitespace-nowrap truncate" style={{ fontVariationSettings: "'wdth' 100" }}>
                          {post.username}
                        </p>
                      </div>
                      <div className="h-[16px] overflow-hidden w-full">
                        <p className="font-['Open_Sans','Noto_Sans_Khmer',sans-serif] font-normal leading-[16px] text-[#71717a] text-[12px] whitespace-nowrap truncate" style={{ fontVariationSettings: "'wdth' 100" }}>
                          {post.type}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Create Date */}
              <div className="min-w-[120px] h-full flex items-center py-[38px] px-[17px]">
                <p className="font-['Open_Sans',sans-serif] font-normal leading-[20px] text-[14px] text-white whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  {new Date(post.createDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>

              {/* Content Type */}
              <div className="min-w-[110px] h-full flex items-center py-[38px] px-[17px]">
                <span className="px-2.5 py-1 bg-[#27272a] border border-[#3f3f46] rounded-md text-white text-xs font-semibold">
                  {post.contentType}
                </span>
              </div>

              {/* Owner */}
              <div className="min-w-[200px] h-full flex items-center py-[38px] px-[17px]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-[#27272a]">
                    <img
                      src={post.contentOwnerAvatar}
                      alt={post.contentOwner}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="font-['Open_Sans',sans-serif] font-normal leading-[16px] text-[13px] text-white whitespace-nowrap truncate" style={{ fontVariationSettings: "'wdth' 100" }}>
                      {post.contentOwner}
                    </p>
                    <p className="font-['Open_Sans',sans-serif] font-normal leading-[14px] text-[11px] text-[#71717a] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      {post.contentOwnerUserId}
                    </p>
                  </div>
                </div>
              </div>

              {/* Views */}
              <div className="flex-1 h-full flex items-center py-[38px]">
                <p className="font-['Open_Sans',sans-serif] font-bold leading-[20px] text-[14px] text-white whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  {post.views}
                </p>
              </div>

              {/* Likes */}
              <div className="flex-1 h-full flex items-center py-[38px]">
                <p className="font-['Open_Sans',sans-serif] font-bold leading-[20px] text-[14px] text-white whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  {post.likes}
                </p>
              </div>

              {/* Saved */}
              <div className="flex-1 h-full flex items-center py-[38px]">
                <p className="font-['Open_Sans',sans-serif] font-bold leading-[20px] text-[14px] text-white whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  {post.saved}
                </p>
              </div>

              {/* Share */}
              <div className="flex-1 h-full flex items-center py-[38px]">
                <p className="font-['Open_Sans',sans-serif] font-bold leading-[20px] text-[14px] text-white whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  {post.share}
                </p>
              </div>

              {/* Impressions */}
              <div className="flex-1 h-full flex items-center py-[38px]">
                <p className="font-['Open_Sans',sans-serif] font-bold leading-[20px] text-[14px] text-white whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  {post.impressions}
                </p>
              </div>
            </div>
            ))
          )}
        </div>
      </div>

      {/* Unpublish Modal */}
      {showUnpublishModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-5 sm:p-8 w-full max-w-md shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-white text-xl font-bold mb-1">Unpublish Content</h2>
                <p className="text-[#71717a] text-sm">Remove selected posts from public view</p>
              </div>
              <button
                className="text-[#71717a] hover:text-white transition-colors p-1 -mt-1"
                onClick={() => setShowUnpublishModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="mb-8">
              <div className="bg-[#27272a]/50 rounded-lg p-4 border border-[#3f3f46]">
                <p className="text-white text-sm mb-2">
                  <span className="font-semibold">{selectedPosts.length}</span> {selectedPosts.length === 1 ? 'post' : 'posts'} will be unpublished
                </p>
                <p className="text-[#71717a] text-xs">
                  These posts will be moved to your "Unpublished" tab and won't be visible to your audience.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                className="flex-1 px-5 py-3 bg-[#27272a] hover:bg-[#3f3f46] text-white text-sm font-semibold rounded-xl transition-colors border border-[#3f3f46]"
                onClick={() => setShowUnpublishModal(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 px-5 py-3 bg-gradient-to-r from-[#ef4444] to-[#dc2626] hover:opacity-90 text-white text-sm font-semibold rounded-xl transition-opacity shadow-lg shadow-[#ef4444]/20"
                onClick={() => {
                  console.log('Unpublishing posts:', selectedPosts);
                  setShowUnpublishModal(false);
                }}
              >
                Unpublish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restrict Modal */}
      {showRestrictModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-5 sm:p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-white text-xl font-bold mb-1">Restrict Content</h2>
                <p className="text-[#71717a] text-sm">Set age ratings and regional restrictions</p>
              </div>
              <button
                className="text-[#71717a] hover:text-white transition-colors p-1 -mt-1"
                onClick={() => {
                  setShowRestrictModal(false);
                  setSelectedRating('');
                  setSelectedRegions([]);
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-6 mb-8">
              {/* Age Rating */}
              <div>
                <label className="text-white text-sm font-semibold mb-3 block">Age Rating</label>
                <div className="grid grid-cols-5 gap-2">
                  {['G', 'PG', 'PG-13', 'R', '18+'].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setSelectedRating(rating)}
                      className={`py-3 px-2 rounded-lg text-sm font-semibold transition-all ${
                        selectedRating === rating
                          ? 'bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white shadow-lg shadow-[#f97316]/20 border border-[#f97316]'
                          : 'bg-[#27272a] text-[#71717a] hover:text-white hover:bg-[#3f3f46] border border-[#3f3f46]'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
                <p className="text-[#71717a] text-xs mt-2">
                  {selectedRating === 'G' && 'General Audiences - All ages admitted'}
                  {selectedRating === 'PG' && 'Parental Guidance Suggested'}
                  {selectedRating === 'PG-13' && 'Parents Strongly Cautioned - Some material may be inappropriate for children under 13'}
                  {selectedRating === 'R' && 'Restricted - Under 17 requires accompanying parent or adult guardian'}
                  {selectedRating === '18+' && 'Adults Only - No one 17 and under admitted'}
                  {!selectedRating && 'Select an age rating to classify this content'}
                </p>
              </div>

              {/* Regional Blocking */}
              <div>
                <label className="text-white text-sm font-semibold mb-3 block">Block in Regions (Optional)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { code: 'US', name: 'United States' },
                    { code: 'UK', name: 'United Kingdom' },
                    { code: 'EU', name: 'European Union' },
                    { code: 'CN', name: 'China' },
                    { code: 'JP', name: 'Japan' },
                    { code: 'KR', name: 'South Korea' },
                    { code: 'IN', name: 'India' },
                    { code: 'AU', name: 'Australia' },
                    { code: 'CA', name: 'Canada' },
                  ].map((region) => (
                    <button
                      key={region.code}
                      onClick={() => {
                        setSelectedRegions((prev) =>
                          prev.includes(region.code)
                            ? prev.filter((r) => r !== region.code)
                            : [...prev, region.code]
                        );
                      }}
                      className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                        selectedRegions.includes(region.code)
                          ? 'bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]'
                          : 'bg-[#27272a] text-[#71717a] hover:text-white hover:bg-[#3f3f46] border border-[#3f3f46]'
                      }`}
                    >
                      {region.code}
                    </button>
                  ))}
                </div>
                <p className="text-[#71717a] text-xs mt-2">
                  {selectedRegions.length > 0
                    ? `Content will be blocked in ${selectedRegions.length} ${selectedRegions.length === 1 ? 'region' : 'regions'}`
                    : 'Select regions where this content should be blocked'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                className="flex-1 px-5 py-3 bg-[#27272a] hover:bg-[#3f3f46] text-white text-sm font-semibold rounded-xl transition-colors border border-[#3f3f46]"
                onClick={() => {
                  setShowRestrictModal(false);
                  setSelectedRating('');
                  setSelectedRegions([]);
                }}
              >
                Cancel
              </button>
              <button
                className="flex-1 px-5 py-3 bg-gradient-to-r from-[#f97316] to-[#ea580c] hover:opacity-90 text-white text-sm font-semibold rounded-xl transition-opacity shadow-lg shadow-[#f97316]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedRating}
                onClick={() => {
                  console.log('Applying restrictions:', {
                    rating: selectedRating,
                    blockedRegions: selectedRegions,
                    posts: selectedPosts,
                  });
                  setShowRestrictModal(false);
                  setSelectedRating('');
                  setSelectedRegions([]);
                }}
              >
                Apply Restrictions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters Modal */}
      {showFiltersModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-5 sm:p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-white text-xl font-bold mb-1">Filters</h2>
                <p className="text-[#71717a] text-sm">Refine your content search</p>
              </div>
              <button
                className="text-[#71717a] hover:text-white transition-colors p-1 -mt-1"
                onClick={() => setShowFiltersModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-6 mb-8">
              {/* Post Types */}
              <div>
                <label className="text-white text-sm font-semibold mb-3 block">Post Types</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Story', 'Explore', 'Short', 'Live'].map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setSelectedPostTypes((prev) =>
                          prev.includes(type)
                            ? prev.filter((t) => t !== type)
                            : [...prev, type]
                        );
                      }}
                      className={`py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
                        selectedPostTypes.includes(type)
                          ? 'bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white shadow-lg shadow-[#f97316]/20 border border-[#f97316]'
                          : 'bg-[#27272a] text-[#71717a] hover:text-white hover:bg-[#3f3f46] border border-[#3f3f46]'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Views Range */}
              <div>
                <label className="text-white text-sm font-semibold mb-3 block">Views Range</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={viewsRange.min}
                    onChange={(e) => setViewsRange({ ...viewsRange, min: e.target.value })}
                    className="flex-1 bg-[#27272a] text-white placeholder:text-[#52525b] px-4 py-2.5 rounded-lg border border-[#3f3f46] focus:outline-none focus:border-[#f97316] transition-colors text-sm"
                  />
                  <span className="text-[#71717a]">—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={viewsRange.max}
                    onChange={(e) => setViewsRange({ ...viewsRange, max: e.target.value })}
                    className="flex-1 bg-[#27272a] text-white placeholder:text-[#52525b] px-4 py-2.5 rounded-lg border border-[#3f3f46] focus:outline-none focus:border-[#f97316] transition-colors text-sm"
                  />
                </div>
              </div>

              {/* Likes Range */}
              <div>
                <label className="text-white text-sm font-semibold mb-3 block">Likes Range</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={likesRange.min}
                    onChange={(e) => setLikesRange({ ...likesRange, min: e.target.value })}
                    className="flex-1 bg-[#27272a] text-white placeholder:text-[#52525b] px-4 py-2.5 rounded-lg border border-[#3f3f46] focus:outline-none focus:border-[#f97316] transition-colors text-sm"
                  />
                  <span className="text-[#71717a]">—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={likesRange.max}
                    onChange={(e) => setLikesRange({ ...likesRange, max: e.target.value })}
                    className="flex-1 bg-[#27272a] text-white placeholder:text-[#52525b] px-4 py-2.5 rounded-lg border border-[#3f3f46] focus:outline-none focus:border-[#f97316] transition-colors text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                className="flex-1 px-5 py-3 bg-[#27272a] hover:bg-[#3f3f46] text-white text-sm font-semibold rounded-xl transition-colors border border-[#3f3f46]"
                onClick={() => {
                  setSelectedPostTypes([]);
                  setViewsRange({ min: '', max: '' });
                  setLikesRange({ min: '', max: '' });
                }}
              >
                Clear All
              </button>
              <button
                className="flex-1 px-5 py-3 bg-gradient-to-r from-[#f97316] to-[#ea580c] hover:opacity-90 text-white text-sm font-semibold rounded-xl transition-opacity shadow-lg shadow-[#f97316]/20"
                onClick={() => setShowFiltersModal(false)}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Date Range Modal */}
      {showDateRangeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-5 sm:p-8 w-full max-w-md shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-white text-xl font-bold mb-1">Select Date Range</h2>
                <p className="text-[#71717a] text-sm">Filter content by creation date</p>
              </div>
              <button
                className="text-[#71717a] hover:text-white transition-colors p-1 -mt-1"
                onClick={() => setShowDateRangeModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4 mb-8">
              {/* Start Date */}
              <div>
                <label className="text-white text-sm font-semibold mb-2 block">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full bg-[#27272a] text-white px-4 py-2.5 rounded-lg border border-[#3f3f46] focus:outline-none focus:border-[#f97316] transition-colors text-sm"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="text-white text-sm font-semibold mb-2 block">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full bg-[#27272a] text-white px-4 py-2.5 rounded-lg border border-[#3f3f46] focus:outline-none focus:border-[#f97316] transition-colors text-sm"
                />
              </div>

              {/* Quick Presets */}
              <div>
                <label className="text-white text-sm font-semibold mb-2 block">Quick Select</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const end = new Date('2026-04-18');
                      const start = new Date(end);
                      start.setDate(start.getDate() - 7);
                      setDateRange({
                        start: start.toISOString().split('T')[0],
                        end: end.toISOString().split('T')[0],
                      });
                    }}
                    className="py-2 px-3 bg-[#27272a] hover:bg-[#3f3f46] text-white text-sm rounded-lg transition-colors border border-[#3f3f46]"
                  >
                    Last 7 days
                  </button>
                  <button
                    onClick={() => {
                      const end = new Date('2026-04-18');
                      const start = new Date(end);
                      start.setDate(start.getDate() - 14);
                      setDateRange({
                        start: start.toISOString().split('T')[0],
                        end: end.toISOString().split('T')[0],
                      });
                    }}
                    className="py-2 px-3 bg-[#27272a] hover:bg-[#3f3f46] text-white text-sm rounded-lg transition-colors border border-[#3f3f46]"
                  >
                    Last 14 days
                  </button>
                  <button
                    onClick={() => {
                      const end = new Date('2026-04-18');
                      const start = new Date(end);
                      start.setDate(start.getDate() - 30);
                      setDateRange({
                        start: start.toISOString().split('T')[0],
                        end: end.toISOString().split('T')[0],
                      });
                    }}
                    className="py-2 px-3 bg-[#27272a] hover:bg-[#3f3f46] text-white text-sm rounded-lg transition-colors border border-[#3f3f46]"
                  >
                    Last 30 days
                  </button>
                  <button
                    onClick={() => {
                      const end = new Date('2026-04-18');
                      const start = new Date(end);
                      start.setDate(start.getDate() - 90);
                      setDateRange({
                        start: start.toISOString().split('T')[0],
                        end: end.toISOString().split('T')[0],
                      });
                    }}
                    className="py-2 px-3 bg-[#27272a] hover:bg-[#3f3f46] text-white text-sm rounded-lg transition-colors border border-[#3f3f46]"
                  >
                    Last 90 days
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                className="flex-1 px-5 py-3 bg-[#27272a] hover:bg-[#3f3f46] text-white text-sm font-semibold rounded-xl transition-colors border border-[#3f3f46]"
                onClick={() => setShowDateRangeModal(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 px-5 py-3 bg-gradient-to-r from-[#f97316] to-[#ea580c] hover:opacity-90 text-white text-sm font-semibold rounded-xl transition-opacity shadow-lg shadow-[#f97316]/20"
                onClick={() => setShowDateRangeModal(false)}
              >
                Apply Date Range
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentLibrary;
