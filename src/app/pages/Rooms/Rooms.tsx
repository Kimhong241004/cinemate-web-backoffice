import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Users2, Film, X, Eye, Search, SlidersHorizontal, MoreHorizontal, StopCircle, Ban } from 'lucide-react';
import Pagination from '../../components/shared/Pagination';

type RoomStatus = 'active' | 'inactive' | 'finished';

interface ContentItem {
  global_id: string;
  title: string;
  type: 'movie' | 'series' | 'episode' | 'season';
  ticket_price: number;
}

interface Participant {
  id: string;
  name: string;
  access: string;
  joinedAt: string;
}

interface Room {
  id: string;
  name: string;
  contents: ContentItem[];
  host: string;
  participants: number;
  createdAt: string;
  watchedAt: string;
  duration: string;
  status: RoomStatus;
  participantList: Participant[];
}

const mockRooms: Room[] = [
  {
    id: '#4291',
    name: 'Movie Night ',
    contents: [
      { global_id: 'cnt-001', title: 'Fast & Furious 10', type: 'movie', ticket_price: 2500 },
      { global_id: 'cnt-002', title: 'Fast & Furious 9', type: 'movie', ticket_price: 2500 },
    ],
    host: 'Sokha Chan',
    participants: 3,
    createdAt: '27 May 2026 8:00pm',
    watchedAt: '10 June 2026',
    duration: '1h 42m',
    status: 'finished',
    participantList: [
      { id: '1', name: 'Sokha Chan', access: 'Plan (free)', joinedAt: '2026-05-27T20:00:00' },
      { id: '2', name: 'Dara', access: 'Ticket #17', joinedAt: '2026-05-27T20:05:00' },
      { id: '3', name: 'Guest#1521', access: 'Ticket #18', joinedAt: '2026-05-27T20:10:00' },
    ],
  },
  {
    id: '#4292',
    name: 'Avengers Night ',
    contents: [
      { global_id: 'cnt-003', title: 'Avengers: Endgame', type: 'movie', ticket_price: 2500 },
      { global_id: 'cnt-004', title: 'Avengers: Infinity War', type: 'movie', ticket_price: 2500 },
      { global_id: 'cnt-005', title: 'Loki S1 E1', type: 'episode', ticket_price: 1500 },
    ],
    host: 'Mony Rith',
    participants: 2,
    createdAt: '27 May 2026 7:00pm',
    watchedAt: '30 May 2026',
    duration: '2h 11m',
    status: 'active',
    participantList: [
      { id: '1', name: 'Mony Rith', access: 'Plan (free)', joinedAt: '2026-05-27T19:00:00' },
      { id: '2', name: 'Guest#2043', access: 'Ticket #21', joinedAt: '2026-05-27T19:03:00' },
    ],
  },
  {
    id: '#4290',
    name: 'Spidey Room ',
    contents: [
      { global_id: 'cnt-006', title: 'Spider-Man: No Way Home', type: 'movie', ticket_price: 2500 },
    ],
    host: 'Virak Ly',
    participants: 1,
    createdAt: '26 May 2026 9:00pm',
    watchedAt: '-',
    duration: '-',
    status: 'inactive',
    participantList: [
      { id: '1', name: 'Virak Ly', access: 'Plan (free)', joinedAt: '2026-05-26T21:00:00' },
    ],
  },
];

const ITEMS_PER_PAGE = 10;

const statusConfig: Record<RoomStatus, { label: string; color: string }> = {
  active:   { label: 'Active',   color: 'bg-green-500/10 text-green-500 border border-green-500/20' },
  inactive: { label: 'Inactive', color: 'bg-[#71717a]/10 text-[#71717a] border border-[#71717a]/20' },
  finished: { label: 'Finished', color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
};

export default function Rooms() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | RoomStatus>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [modalTab, setModalTab] = useState<'info' | 'contents' | 'participants'>('info');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target as Node)) {
        setShowFilterDropdown(false);
      }
      setOpenMenuId(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = mockRooms.filter((room) => {
    const matchSearch =
      room.id.toLowerCase().includes(search.toLowerCase()) ||
      room.contents.some(c => c.title.toLowerCase().includes(search.toLowerCase())) ||
      room.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || room.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-bold">{t.rooms.title}</h1>
        <p className="text-[#71717a] text-sm mt-1">{t.rooms.subtitle}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t.rooms.totalRooms,        value: '3', icon: Users2, color: 'text-[#3b82f6]' },
          { label: t.rooms.activeNow,         value: '1', icon: Film,   color: 'text-[#22c55e]' },
          { label: t.rooms.finishedToday,     value: '1', icon: Film,   color: 'text-[#f59e0b]' },
          { label: t.rooms.totalParticipants, value: '6', icon: Users2, color: 'text-[#a855f7]' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#18181b] border border-[#27272a] rounded-2xl p-4">
            <p className="text-[#71717a] text-xs mb-1">{stat.label}</p>
            <p className={`${stat.color} text-2xl font-bold`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-4 justify-between">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder={t.rooms.searchPlaceholder}
            className="w-full bg-[#18181b] text-white placeholder:text-[#52525b] pl-4 pr-10 py-2.5 rounded-lg border border-[#27272a] focus:outline-none focus:border-[#3f3f46] transition-colors text-sm"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b]" />
        </div>

        <div className="relative" ref={filterDropdownRef}>
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#18181b] border border-[#27272a] rounded-lg text-white text-sm hover:bg-[#27272a] transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filter</span>
            {statusFilter !== 'all' && (
              <span className="ml-1 px-1.5 py-0.5 bg-orange-500 text-white text-xs rounded-full font-bold">1</span>
            )}
          </button>

          {showFilterDropdown && (
            <div className="absolute right-0 mt-2 w-52 bg-[#18181b] border border-[#27272a] rounded-lg shadow-xl z-10">
              <div className="p-4 space-y-2">
                <label className="text-[#71717a] text-xs font-bold uppercase tracking-wider mb-2 block">Status</label>
                {(['all', 'active', 'inactive', 'finished'] as const).map((val) => (
                  <label key={val} className="flex items-center gap-2 cursor-pointer hover:bg-[#27272a] px-2 py-1.5 rounded transition-colors">
                    <input
                      type="radio"
                      name="roomStatus"
                      value={val}
                      checked={statusFilter === val}
                      onChange={() => { setStatusFilter(val); setCurrentPage(1); setShowFilterDropdown(false); }}
                      className="w-4 h-4 accent-orange-500"
                    />
                    <span className="text-white text-sm capitalize">
                      {val === 'all' ? t.common.all : t.rooms.status[val]}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl">
        <div className="overflow-x-auto rounded-2xl">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#27272a] bg-[#0a0a0a]">
                {[
                  t.rooms.table.no,
                  t.rooms.table.roomName,
                  'Total Content',
                  t.rooms.table.host,
                  t.rooms.table.participants,
                  t.rooms.table.createdAt,
                  t.rooms.table.watchedAt,
                  t.rooms.table.status,
                  t.rooms.table.actions,
                ].map((col) => (
                  <th key={col} className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-[#71717a] text-sm">
                    {t.common.noData}
                  </td>
                </tr>
              ) : (
                paginated.map((room, idx) => (
                  <tr key={room.id} className="hover:bg-[#27272a]/30 transition-colors">
                    <td className="px-4 py-4 text-[#71717a] text-sm">
                      {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                    </td>
                    <td className="px-4 py-4 text-white text-sm font-medium">{room.name}</td>
                    <td className="px-4 py-4 text-white text-sm font-medium">{room.contents.length}</td>
                    <td className="px-4 py-4 text-white text-sm">{room.host}</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1 text-white text-sm">
                        <Users2 className="w-3.5 h-3.5 text-[#71717a]" />
                        {room.participants}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[#71717a] text-sm whitespace-nowrap">{room.createdAt}</td>
                    <td className="px-4 py-4 text-[#71717a] text-sm whitespace-nowrap">{room.watchedAt}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[room.status].color}`}>
                        {statusConfig[room.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setSelectedRoom(room); setModalTab('info'); }}
                          className="p-2 rounded-lg hover:bg-[#27272a] transition-colors"
                        >
                          <Eye className="w-4 h-4 text-[#3b82f6]" />
                        </button>
                        <div className="relative">
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === room.id ? null : room.id); }}
                            className="p-2 rounded-lg hover:bg-[#27272a] transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4 text-[#6C5CE7]" />
                          </button>
                          {openMenuId === room.id && (
                            <div className="absolute right-0 mt-1 w-44 bg-[#18181b] border border-[#27272a] rounded-lg shadow-xl z-20 overflow-hidden">
                              <button
                                onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-white hover:bg-[#27272a] transition-colors"
                              >
                                <StopCircle className="w-4 h-4 text-[#f59e0b]" />
                                End Room
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#ef4444] hover:bg-[#27272a] transition-colors"
                              >
                                <Ban className="w-4 h-4" />
                                Disable Room
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-4 border-t border-[#27272a]">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* View Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#27272a] flex-shrink-0">
              <h2 className="text-white font-bold">{t.rooms.modal.title} {selectedRoom.id}</h2>
              <button onClick={() => setSelectedRoom(null)} className="text-[#71717a] hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#27272a] flex-shrink-0">
              {(['info', 'contents', 'participants'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setModalTab(tab)}
                  className={`px-5 py-3 text-sm font-medium capitalize transition-colors relative ${
                    modalTab === tab ? 'text-white' : 'text-[#71717a] hover:text-white'
                  }`}
                >
                  {tab === 'contents' ? `Contents (${selectedRoom.contents.length})` : tab === 'participants' ? `Participants (${selectedRoom.participantList.length})` : 'Info'}
                  {modalTab === tab && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Body */}
            <div className="p-5 overflow-y-auto">
              {/* Info Tab */}
              {modalTab === 'info' && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {[
                    { label: t.rooms.modal.host, value: selectedRoom.host },
                    { label: 'Status', value: statusConfig[selectedRoom.status].label },
                    { label: t.rooms.modal.createdAt, value: selectedRoom.createdAt },
                    { label: t.rooms.modal.startedAt, value: selectedRoom.watchedAt },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-[#71717a] text-xs">{item.label}</p>
                      <p className="text-white font-medium mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Contents Tab */}
              {modalTab === 'contents' && (
                <div className="bg-[#0a0a0a] rounded-xl overflow-hidden border border-[#27272a]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#27272a]">
                        <th className="px-3 py-2.5 text-left text-[#71717a] text-xs font-bold uppercase">Title</th>
                        <th className="px-3 py-2.5 text-left text-[#71717a] text-xs font-bold uppercase">Type</th>
                        <th className="px-3 py-2.5 text-right text-[#71717a] text-xs font-bold uppercase">Ticket Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#27272a]">
                      {selectedRoom.contents.map((c) => (
                        <tr key={c.global_id}>
                          <td className="px-3 py-2.5 text-white">{c.title}</td>
                          <td className="px-3 py-2.5 capitalize text-[#71717a]">{c.type}</td>
                          <td className="px-3 py-2.5 text-right">
                            <span className="text-white font-medium">{new Intl.NumberFormat('en-US').format(c.ticket_price)}</span>
                            <span className="text-[#f97316] ml-1">&#x17DB;</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-[#27272a]">
                        <td colSpan={2} className="px-3 py-2.5 text-[#71717a] text-xs font-bold uppercase">Total per new member</td>
                        <td className="px-3 py-2.5 text-right">
                          <span className="text-white font-bold">{new Intl.NumberFormat('en-US').format(selectedRoom.contents.reduce((sum, c) => sum + c.ticket_price, 0))}</span>
                          <span className="text-[#f97316] ml-1">&#x17DB;</span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {/* Participants Tab */}
              {modalTab === 'participants' && (
                <div className="bg-[#0a0a0a] rounded-xl overflow-hidden border border-[#27272a]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#27272a]">
                        <th className="px-3 py-2.5 text-left text-[#71717a] text-xs font-bold uppercase">{t.rooms.modal.user}</th>
                        <th className="px-3 py-2.5 text-left text-[#71717a] text-xs font-bold uppercase">{t.rooms.modal.access}</th>
                        <th className="px-3 py-2.5 text-left text-[#71717a] text-xs font-bold uppercase">{t.rooms.modal.joinedAt}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#27272a]">
                      {selectedRoom.participantList.map((p) => (
                        <tr key={p.id}>
                          <td className="px-3 py-2.5 text-white">{p.name}</td>
                          <td className="px-3 py-2.5">
                            {p.access.toLowerCase().startsWith('ticket') ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">Purchase</span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">Plan</span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-[#71717a]">
                            {new Date(p.joinedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}