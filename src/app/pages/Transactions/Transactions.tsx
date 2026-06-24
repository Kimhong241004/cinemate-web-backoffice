import { useState } from 'react';
import { Search, SlidersHorizontal, Download, X, Check, Eye } from 'lucide-react';
import Pagination from '../../components/shared/Pagination';
import { useLanguage } from '../../context/LanguageContext';
import type { TransactionFromApi } from '../../../api/services/transactionService';

const TAKE = 10;

// ── Mock Data ──────────────────────────────────────────────────────────────────

const mockTransactions: TransactionFromApi[] = [
  {
    global_id: 'txn-001',
    transaction_id: 'TXN-84F2A1C9',
    amount: 8000,
    payment_method: 'Wallet Top-Up',
    payment_status: 'bank_paid',
    purchase_type: 'plan',
    date: '2024-05-01',
    time: '09:15:22',
    user: { global_id: 'usr-001', name: 'Sophea Meas', user_type: 'user', contact: '+855 12 345 678', profile_url: null },
  },
  {
    global_id: 'txn-002',
    transaction_id: 'TXN-3D7B0E52',
    amount: 2500,
    payment_method: 'khqr',
    payment_status: 'bank_paid',
    purchase_type: 'ticket',
    date: '2024-05-02',
    time: '11:30:05',
    user: { global_id: 'usr-002', name: 'Dara Chan', user_type: 'user', contact: '+855 17 654 321', profile_url: null },
  },
  {
    global_id: 'txn-003',
    transaction_id: 'TXN-C61F9A3E',
    amount: 12000,
    payment_method: 'acleda',
    payment_status: 'processing',
    purchase_type: 'plan',
    date: '2024-05-03',
    time: '14:00:47',
    user: { global_id: 'usr-003', name: 'Ratana Sok', user_type: 'user', contact: '+855 89 123 456', profile_url: null },
  },
  {
    global_id: 'txn-004',
    transaction_id: 'TXN-A09D4F71',
    amount: 1500,
    payment_method: 'wing',
    payment_status: 'failed',
    purchase_type: 'ticket',
    date: '2024-05-04',
    time: '16:45:13',
    user: { global_id: 'gst-4a2f9c1d', name: '', user_type: 'guest', contact: '', profile_url: null },
  },
  {
    global_id: 'txn-005',
    transaction_id: 'TXN-58E2B3D0',
    amount: 5000,
    payment_method: 'khqr',
    payment_status: 'bank_paid',
    purchase_type: 'ticket',
    date: '2024-05-05',
    time: '08:20:34',
    user: { global_id: 'gst-7b8e3d2a', name: '', user_type: 'guest', contact: '', profile_url: null },
  },
  {
    global_id: 'txn-006',
    transaction_id: 'TXN-2F4C8B1A',
    amount: 8000,
    payment_method: 'aba_bank',
    payment_status: 'pending',
    purchase_type: 'plan',
    date: '2024-05-06',
    time: '10:10:58',
    user: { global_id: 'usr-006', name: 'Bopha Noun', user_type: 'user', contact: '+855 98 444 555', profile_url: null },
  },
  {
    global_id: 'txn-007',
    transaction_id: 'TXN-7E1D6C4B',
    amount: 15000,
    payment_method: 'Wallet Top-Up',
    payment_status: 'bank_paid',
    purchase_type: 'ticket',
    date: '2024-05-07',
    time: '13:55:09',
    user: { global_id: 'usr-007', name: 'Piseth Ros', user_type: 'user', contact: '+855 11 666 777', profile_url: null },
  },
];

const mockSummary = {
  total: mockTransactions.reduce((s, tx) => s + tx.amount, 0),
  locked: mockTransactions.filter((tx) => tx.payment_status === 'pending').reduce((s, tx) => s + tx.amount, 0),
  processing: mockTransactions.filter((tx) => tx.payment_status === 'processing').reduce((s, tx) => s + tx.amount, 0),
  bank_paid: mockTransactions.filter((tx) => tx.payment_status === 'bank_paid').reduce((s, tx) => s + tx.amount, 0),
};

// ── Helpers ────────────────────────────────────────────────────────────────────

const formatAmount = (n: number) =>
  `${new Intl.NumberFormat('en-US').format(n)} ៛`;

const StatusChip = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; cls: string }> = {
    pending:    { label: 'Pending',    cls: 'bg-[#f59e0b]/20 text-[#f59e0b]' },
    processing: { label: 'Processing', cls: 'bg-[#3b82f6]/20 text-[#3b82f6]' },
    bank_paid:  { label: 'Paid',       cls: 'bg-[#22c55e]/20 text-[#22c55e]' },
    failed:     { label: 'Failed',     cls: 'bg-[#ef4444]/20 text-[#ef4444]' },
    cancelled:  { label: 'Cancelled',  cls: 'bg-[#ef4444]/20 text-[#ef4444]' },
  };
  const s = map[status] ?? { label: status, cls: 'bg-[#27272a] text-[#71717a]' };
  return (
    <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${s.cls}`}>
      {s.label}
    </span>
  );
};

const UserAvatar = ({ src, name, size = 8 }: { src: string | null; name: string; size?: number }) => (
  <div className={`w-${size} h-${size} rounded-full bg-[#27272a] overflow-hidden flex-shrink-0 flex items-center justify-center`}>
    {src ? (
      <img src={src} alt={name} className="w-full h-full object-cover" />
    ) : (
      <span className="text-[#71717a] text-xs font-bold">
        {name.charAt(0).toUpperCase()}
      </span>
    )}
  </div>
);

// ── Component ──────────────────────────────────────────────────────────────────

const Transactions = () => {
  const { t } = useLanguage();

  const [transactions] = useState<TransactionFromApi[]>(mockTransactions);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [viewTx, setViewTx] = useState<TransactionFromApi | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = transactions.filter((tx) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      (tx.transaction_id ?? '').toLowerCase().includes(q) ||
      tx.user.name.toLowerCase().includes(q) ||
      tx.user.contact.toLowerCase().includes(q);
    const matchStatus = !selectedStatus || tx.payment_status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / TAKE);
  const skip = (currentPage - 1) * TAKE;
  const paginated = filtered.slice(skip, skip + TAKE);

  const handleExport = () => showToast(t.transactions.exportingMsg, 'success');

  const summaryCards = [
    { label: t.transactions.statusTotal,      value: formatAmount(mockSummary.total),      color: 'text-[#3b82f6]' },
    { label: t.transactions.statusLocked,     value: formatAmount(mockSummary.locked),     color: 'text-[#ef4444]' },
    { label: t.transactions.statusProcessing, value: formatAmount(mockSummary.processing), color: 'text-[#22c55e]' },
    { label: t.transactions.statusBankPaid,   value: formatAmount(mockSummary.bank_paid),  color: 'text-[#f59e0b]' },
  ];

  const statusOptions = [
    { value: '',           label: t.transactions.allStatus },
    { value: 'pending',    label: t.transactions.pending },
    { value: 'processing', label: 'Processing' },
    { value: 'bank_paid',  label: 'Paid' },
    { value: 'failed',     label: t.transactions.failed },
  ];

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-white text-xl sm:text-2xl lg:text-3xl font-bold mb-1">{t.transactions.title}</h1>
            <p className="text-[#71717a] text-sm">{t.transactions.subtitle}</p>
          </div>
          <button
            onClick={handleExport}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] rounded-lg text-white text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <Download className="w-4 h-4" />
            {t.transactions.export}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((s, i) => (
            <div key={i} className="bg-[#18181b] border border-[#27272a] rounded-xl p-5">
              <p className="text-[#71717a] text-sm mb-2">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={t.transactions.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#18181b] text-white placeholder:text-[#52525b] pl-4 pr-10 py-2.5 rounded-lg border border-[#27272a] focus:outline-none focus:border-[#3f3f46] transition-colors text-sm"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b]" />
          </div>

          <div className="relative w-full sm:w-auto">
            <button
              onClick={(e) => { e.stopPropagation(); setShowStatusFilter(!showStatusFilter); }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-[#18181b] border border-[#27272a] rounded-lg text-white text-sm hover:bg-[#27272a] transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>{t.transactions.status}</span>
              {selectedStatus && <span className="w-2 h-2 rounded-full bg-[#ef4444]" />}
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showStatusFilter && (
              <div className="absolute z-10 mt-2 w-48 bg-[#18181b] border border-[#27272a] rounded-lg shadow-lg">
                <div className="p-2">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setSelectedStatus(opt.value); setShowStatusFilter(false); }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                        selectedStatus === opt.value ? 'bg-[#27272a] text-[#f97316]' : 'text-white hover:bg-[#27272a]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#27272a] bg-[#0a0a0a]">
                <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">No.</th>
                <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">{t.transactions.account}</th>
                <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">Type</th>
                <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">{t.transactions.transactionId}</th>
                <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">{t.transactions.timestamp}</th>
                <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">{t.transactions.paymentMethod}</th>
                <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">{t.transactions.amount}</th>
                <th className="px-4 py-4 text-left text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">{t.transactions.status}</th>
                <th className="px-4 py-4 text-center text-[#71717a] text-xs font-bold uppercase tracking-wider whitespace-nowrap">{t.transactions.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <p className="text-[#71717a] text-sm">{t.transactions.noFound}</p>
                  </td>
                </tr>
              ) : (
                paginated.map((tx, i) => (
                  <tr key={tx.global_id} className="hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                    <td className="px-4 py-3.5 text-white text-sm whitespace-nowrap">{skip + i + 1}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <UserAvatar src={tx.user.profile_url} name={tx.user.user_type === 'guest' ? 'G' : tx.user.name} size={7} />
                        <div>
                          {tx.user.user_type === 'guest' ? (
                            <>
                              <p className="text-[#71717a] text-sm font-medium">Guest</p>
                              <p className="text-[#52525b] text-xs font-mono">{tx.user.global_id}</p>
                            </>
                          ) : (
                            <>
                              <p className="text-white text-sm font-medium">{tx.user.name}</p>
                              <p className="text-[#71717a] text-xs">{tx.user.contact}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                        tx.purchase_type === 'ticket'
                          ? 'bg-[#3b82f6]/20 text-[#3b82f6]'
                          : 'bg-[#a855f7]/20 text-[#a855f7]'
                      }`}>
                        {tx.purchase_type === 'ticket' ? 'Movie' : 'Plan'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-white text-xs font-mono font-semibold whitespace-nowrap max-w-[140px] truncate" title={tx.transaction_id ?? ''}>
                      {tx.transaction_id ? `${tx.transaction_id.slice(0, 12)}…` : ''}
                    </td>
                    <td className="px-4 py-3.5 text-white text-xs whitespace-nowrap">
                      <p>{tx.date}</p>
                      <p>{tx.time}</p>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="inline-flex px-3 py-1.5 bg-[#27272a] text-white text-xs rounded-full font-medium capitalize">
                        {tx.payment_method.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-white text-sm font-bold whitespace-nowrap">
                      {formatAmount(tx.amount)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <StatusChip status={tx.payment_status} />
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setViewTx(tx)}
                          className="p-2 rounded-lg hover:bg-[#27272a] transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4 text-[#3b82f6]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          disabled={false}
          summary={<>{t.transactions.showing} <span className="text-white font-medium">{filtered.length > 0 ? skip + 1 : 0}</span> {t.transactions.to} <span className="text-white font-medium">{Math.min(skip + TAKE, filtered.length)}</span> {t.transactions.of} <span className="text-white font-medium">{filtered.length}</span> {t.transactions.entries}</>}
        />
      </div>

      {/* View Modal */}
      {viewTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-5 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl font-bold">{t.transactions.transactionDetails}</h2>
              <button onClick={() => setViewTx(null)} className="p-2 rounded-lg hover:bg-[#27272a] transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* User */}
            <div className="flex items-center gap-3 mb-5 p-4 bg-[#27272a] rounded-xl">
              <UserAvatar src={viewTx.user.profile_url} name={viewTx.user.name} size={10} />
              <div>
                <p className="text-white font-semibold">{viewTx.user.name}</p>
                <p className="text-[#71717a] text-xs">{viewTx.user.contact}</p>
                <p className="text-[#52525b] text-xs capitalize">{viewTx.user.user_type}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[#71717a] text-xs mb-1">{t.transactions.transactionId}</p>
                  <p className="text-white text-xs font-mono break-all">{viewTx.transaction_id ?? '—'}</p>
                </div>
                <div>
                  <p className="text-[#71717a] text-xs mb-1">{t.transactions.status}</p>
                  <StatusChip status={viewTx.payment_status} />
                </div>
                <div>
                  <p className="text-[#71717a] text-xs mb-1">Purchase Type</p>
                  <p className="text-white text-sm">{viewTx.purchase_type}</p>
                </div>
                <div>
                  <p className="text-[#71717a] text-xs mb-1">{t.transactions.amount}</p>
                  <p className="text-white text-sm font-bold">{formatAmount(viewTx.amount)}</p>
                </div>
                <div>
                  <p className="text-[#71717a] text-xs mb-1">{t.transactions.paymentMethod}</p>
                  <p className="text-white text-sm capitalize">{viewTx.payment_method.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-[#71717a] text-xs mb-1">{t.transactions.timestamp}</p>
                  <p className="text-white text-sm">{viewTx.date}</p>
                  <p className="text-[#71717a] text-xs">{viewTx.time}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#27272a]">
                <button
                  onClick={() => setViewTx(null)}
                  className="px-4 py-2 rounded-lg bg-[#27272a] text-white text-sm hover:bg-[#3f3f46] transition-colors"
                >
                  {t.transactions.close}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
            toast.type === 'success' ? 'bg-[#22c55e] text-white' : 'bg-[#ef4444] text-white'
          }`}>
            {toast.type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Transactions;
