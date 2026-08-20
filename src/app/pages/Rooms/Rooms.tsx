import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';
import { Users2, Film, X, Eye, Search, MoreHorizontal, Ban, CheckCircle } from 'lucide-react';
import Pagination from '../../components/shared/Pagination';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import StatusFilterDropdown from '../../components/shared/FilterDropdown/StatusFilterDropdown';
import { TableContainer, TableHead, Th, TableBody, TableRow, Td, TableMessageRow } from '../../components/shared/Table/Table';
import { roomService, type RoomFromApi, type RoomStatus, type RoomDetail } from '../../../api/services/roomService';

const ITEMS_PER_PAGE = 10;

const statusConfig: Record<RoomStatus, { label: string; color: string }> = {
  active:      { label: 'Active',      color: 'bg-green-500/10 text-green-500 border border-green-500/20' },
  inactive:    { label: 'Inactive',    color: 'bg-[#71717a]/10 text-[#71717a] border border-[#71717a]/20' },
  deactivated: { label: 'Deactivated', color: 'bg-red-500/10 text-red-400 border border-red-500/20' },
  deleted:     { label: 'Deleted',     color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
};

const UNKNOWN_STATUS = { label: 'Unknown', color: 'bg-[#71717a]/10 text-[#71717a] border border-[#71717a]/20' };
const getStatusConfig = (status: RoomStatus) => statusConfig[status] ?? UNKNOWN_STATUS;

// Single source of truth for a room's displayed status, so the table/modal badge,
// the stat counts, and the activate/deactivate menu all agree with each other.
// status and room_status are independent — a room can be enabled (status: 1) but idle
// (room_status: 'inactive'), so "Active" requires both fields to agree.
const getDisplayStatus = (room: RoomFromApi): RoomStatus => {
  if (room.room_status === 'deleted' || room.room_status === 'deactivated') return room.room_status;
  return room.room_status === 'active' && room.status === 1 ? 'active' : 'inactive';
};

const formatPrice = (n: number) => `${new Intl.NumberFormat('en-US').format(n)} ៛`;

export default function Rooms() {
  const { t } = useLanguage();
  const { showToast } = useNotification();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RoomStatus | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rooms, setRooms] = useState<RoomFromApi[]>([]);
  const [total, setTotal] = useState(0);
  const [activeTotal, setActiveTotal] = useState(0);
  const [inactiveTotal, setInactiveTotal] = useState(0);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomFromApi | null>(null);
  const [roomDetail, setRoomDetail] = useState<RoomDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [modalTab, setModalTab] = useState<'info' | 'contents' | 'participants'>('info');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deactivateRoomTarget, setDeactivateRoomTarget] = useState<RoomFromApi | null>(null);
  const [activateRoomTarget, setActivateRoomTarget] = useState<RoomFromApi | null>(null);
  const [isActioning, setIsActioning] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('[data-room-menu]')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const res = await roomService.getRooms({
        skip: (currentPage - 1) * ITEMS_PER_PAGE,
        take: ITEMS_PER_PAGE,
        room_status: statusFilter || undefined,
        // API only matches enabled/disabled rooms when `status` is sent alongside room_status:
        // 0 = deactivated (disabled), 1 = activated-but-idle (inactive)
        status: statusFilter === 'deactivated' ? 0 : statusFilter === 'inactive' ? 1 : undefined,
      });
      setRooms(res.data);
      setTotal(res.total);
    } catch {
      showToast('Failed to load rooms', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter]);

  // Active/Inactive counts must reflect the whole dataset, not just the current page,
  // so they're fetched separately via the API's own filtered `total` — take:1 is enough
  // since only `total` is used, not the returned rows.
  const fetchStats = async () => {
    try {
      const [activeRes, inactiveRes] = await Promise.all([
        roomService.getRooms({ room_status: 'active', take: 1 }),
        roomService.getRooms({ room_status: 'inactive', take: 1 }),
      ]);
      setActiveTotal(activeRes.total);
      setInactiveTotal(inactiveRes.total);
    } catch {
      // stats are supplementary; leave previous values on failure
    }
  };

  // No aggregate endpoint exists for participants, so page through every room
  // (take maxes at 100) and sum current_participants across the whole dataset.
  const fetchTotalParticipants = async () => {
    try {
      let skip = 0;
      let sum = 0;
      let grandTotal = Infinity;
      const take = 100;
      while (skip < grandTotal && skip < 5000) {
        const res = await roomService.getRooms({ skip, take });
        grandTotal = res.total;
        sum += res.data.reduce((s, r) => s + r.current_participants, 0);
        skip += take;
      }
      setTotalParticipants(sum);
    } catch {
      // stats are supplementary; leave previous value on failure
    }
  };

  useEffect(() => {
    fetchStats();
    fetchTotalParticipants();
  }, []);

  useEffect(() => {
    if (!selectedRoom) {
      setRoomDetail(null);
      return;
    }
    setIsLoadingDetail(true);
    roomService.getRoom(selectedRoom.global_id)
      .then(setRoomDetail)
      .catch(() => showToast('Failed to load room details', 'error'))
      .finally(() => setIsLoadingDetail(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoom]);

  // GET /v1/rooms doesn't document a search param, so filter by room name/ID
  // client-side — this only narrows the rooms already fetched for the current page.
  const filteredRooms = rooms.filter((room) => {
    if (getDisplayStatus(room) === 'deleted') return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return room.room_name.toLowerCase().includes(q) || room.global_id.toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const handleDeactivateRoom = async () => {
    if (!deactivateRoomTarget) return;
    setIsActioning(true);
    try {
      await roomService.deactivateRoom(deactivateRoomTarget.global_id);
      showToast('Room deactivated', 'success');
      setDeactivateRoomTarget(null);
      fetchRooms();
      fetchStats();
    } catch {
      showToast('Failed to deactivate room', 'error');
    } finally {
      setIsActioning(false);
    }
  };

  const handleActivateRoom = async () => {
    if (!activateRoomTarget) return;
    setIsActioning(true);
    try {
      await roomService.activateRoom(activateRoomTarget.global_id);
      showToast('Room activated', 'success');
      setActivateRoomTarget(null);
      fetchRooms();
      fetchStats();
    } catch {
      showToast('Failed to activate room', 'error');
    } finally {
      setIsActioning(false);
    }
  };

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
          { label: t.rooms.totalRooms,        value: total,        icon: Users2, color: 'text-[#3b82f6]' },
          { label: t.rooms.activeNow,         value: activeTotal,  icon: Film,   color: 'text-[#22c55e]' },
          { label: t.rooms.deactivatedToday,  value: inactiveTotal, icon: Film,  color: 'text-[#f59e0b]' },
          { label: t.rooms.totalParticipants, value: totalParticipants, icon: Users2, color: 'text-[#a855f7]' },
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

        <StatusFilterDropdown
          label="Status"
          allLabel={t.common.all}
          selectedValue={statusFilter}
          onSelect={(v) => { setStatusFilter(v as RoomStatus | ''); setCurrentPage(1); }}
          options={[
            { value: 'active', label: t.rooms.status.active },
            { value: 'inactive', label: t.rooms.status.inactive },
            { value: 'deactivated', label: t.rooms.status.deactivated },
          ]}
        />
      </div>

      {/* Table */}
      <TableContainer>
        <TableHead>
          <Th>{t.rooms.table.no}</Th>
          <Th>{t.rooms.table.roomName}</Th>
          <Th>Total Content</Th>
          <Th>{t.rooms.table.host}</Th>
          <Th>{t.rooms.table.participants}</Th>
          <Th>{t.rooms.table.createdAt}</Th>
          <Th>{t.rooms.table.status}</Th>
          <Th>{t.rooms.table.actions}</Th>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableMessageRow colSpan={8}>{t.common.loading ?? 'Loading...'}</TableMessageRow>
          ) : filteredRooms.length === 0 ? (
            <TableMessageRow colSpan={8}>{t.common.noData}</TableMessageRow>
          ) : (
            filteredRooms.map((room, idx) => (
              <TableRow key={room.global_id}>
                <Td className="text-[#71717a]">{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</Td>
                <Td className="font-medium">{room.room_name}</Td>
                <Td className="font-medium">{room.total_movie}</Td>
                <Td>{room.host?.name || room.host?.username || '-'}</Td>
                <Td>
                  <span className="inline-flex items-center gap-1 text-white text-sm">
                    <Users2 className="w-3.5 h-3.5 text-[#71717a]" />
                    {room.current_participants}
                  </span>
                </Td>
                <Td className="text-[#71717a]">
                  {new Date(room.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </Td>
                <Td>
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusConfig(getDisplayStatus(room)).color}`}>
                    {getStatusConfig(getDisplayStatus(room)).label}
                  </span>
                </Td>
                <Td>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setSelectedRoom(room); setModalTab('info'); }}
                      className="p-2 rounded-lg hover:bg-[#27272a] transition-colors"
                    >
                      <Eye className="w-4 h-4 text-[#6C5CE7]" />
                    </button>
                    <div className="relative" data-room-menu>
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === room.global_id ? null : room.global_id); }}
                        className="p-2 rounded-lg hover:bg-[#27272a] transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4 text-[#6C5CE7]" />
                      </button>
                      {openMenuId === room.global_id && (
                        <div className="absolute right-0 mt-1 w-44 bg-[#18181b] border border-[#27272a] rounded-lg shadow-xl z-20 overflow-hidden">
                          {room.status === 0 ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); setActivateRoomTarget(room); }}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#22c55e] hover:bg-[#27272a] transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Activate Room
                            </button>
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); setDeactivateRoomTarget(room); }}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#ef4444] hover:bg-[#27272a] transition-colors"
                            >
                              <Ban className="w-4 h-4" />
                              Deactivate Room
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Td>
              </TableRow>
            ))
          )}
        </TableBody>
      </TableContainer>

      {/* Pagination — hidden while searching, since search only filters the current page */}
      {!search && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          summary={<>Showing {total > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} to {Math.min(currentPage * ITEMS_PER_PAGE, total)} of {total} entries</>}
        />
      )}

      {/* View Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#27272a] flex-shrink-0">
              <h2 className="text-white font-bold">{t.rooms.modal.title}</h2>
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
                  {tab === 'contents' ? `Contents (${selectedRoom.total_movie})` : tab === 'participants' ? `Participants (${selectedRoom.current_participants})` : 'Info'}
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
                    { label: t.rooms.modal.roomId, value: selectedRoom.global_id, mono: true },
                    { label: t.rooms.modal.host, value: (roomDetail ?? selectedRoom).host?.name || (roomDetail ?? selectedRoom).host?.username || '-', mono: false },
                    { label: 'Status', value: getStatusConfig(getDisplayStatus(selectedRoom)).label, mono: false },
                    { label: t.rooms.modal.createdAt, value: new Date(selectedRoom.created_at).toLocaleString(), mono: false },
                  ].map((item) => (
                    <div key={item.label} className={item.mono ? 'col-span-2' : undefined}>
                      <p className="text-[#71717a] text-xs">{item.label}</p>
                      <p className={`text-white font-medium mt-0.5 ${item.mono ? 'font-mono text-xs break-all' : ''}`}>{item.value}</p>
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
                      {isLoadingDetail ? (
                        <tr><td colSpan={3} className="px-3 py-4 text-center text-[#71717a]">{t.common.loading ?? 'Loading...'}</td></tr>
                      ) : !roomDetail || roomDetail.movies.length === 0 ? (
                        <tr><td colSpan={3} className="px-3 py-4 text-center text-[#71717a]">{t.common.noData}</td></tr>
                      ) : (
                        roomDetail.movies.map((movie) => (
                          <tr key={movie.global_id}>
                            <td className="px-3 py-2.5 text-white">{movie.title}</td>
                            <td className="px-3 py-2.5 text-[#71717a] capitalize">{movie.content_type}</td>
                            <td className="px-3 py-2.5 text-right text-white">{formatPrice(movie.base_price)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-[#27272a]">
                        <td colSpan={2} className="px-3 py-2.5 text-[#71717a] text-xs font-bold uppercase">Total per new member</td>
                        <td className="px-3 py-2.5 text-right text-white font-bold">
                          {formatPrice((roomDetail?.movies ?? []).reduce((sum, m) => sum + Number(m.base_price), 0))}
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
                      {isLoadingDetail ? (
                        <tr><td colSpan={3} className="px-3 py-4 text-center text-[#71717a]">{t.common.loading ?? 'Loading...'}</td></tr>
                      ) : !roomDetail || roomDetail.participants.length === 0 ? (
                        <tr><td colSpan={3} className="px-3 py-4 text-center text-[#71717a]">{t.common.noData}</td></tr>
                      ) : (
                        roomDetail.participants.map((p) => (
                          <tr key={p.global_id}>
                            <td className="px-3 py-2.5 text-white">{p.user.name || p.user.username}</td>
                            <td className="px-3 py-2.5 text-[#71717a] capitalize">{p.user.access_type || '-'}</td>
                            <td className="px-3 py-2.5 text-[#71717a]">{new Date(p.joined_at).toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deactivateRoomTarget}
        title="Deactivate Room"
        message={`Are you sure you want to deactivate "${deactivateRoomTarget?.room_name}"? This room will no longer be accessible.`}
        confirmLabel="Deactivate"
        variant="danger"
        loading={isActioning}
        onConfirm={handleDeactivateRoom}
        onCancel={() => setDeactivateRoomTarget(null)}
      />

      <ConfirmDialog
        isOpen={!!activateRoomTarget}
        title="Activate Room"
        message={`Are you sure you want to activate "${activateRoomTarget?.room_name}"? This room will become accessible again.`}
        confirmLabel="Activate"
        variant="success"
        loading={isActioning}
        onConfirm={handleActivateRoom}
        onCancel={() => setActivateRoomTarget(null)}
      />
    </div>
  );
}
