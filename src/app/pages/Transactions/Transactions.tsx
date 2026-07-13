import { useState, useEffect } from 'react';
import { Search, Download, X, Check, Eye } from 'lucide-react';
import Pagination from '../../components/shared/Pagination';
import StatusFilterDropdown from '../../components/shared/FilterDropdown/StatusFilterDropdown';
import { TableContainer, TableHead, Th, TableBody, TableRow, Td, TableMessageRow } from '../../components/shared/Table/Table';
import { useLanguage } from '../../context/LanguageContext';
import { transactionService, type TransactionFromApi, type TransactionSummary, type TransactionUser } from '../../../api/services/transactionService';

const TAKE = 10;

const EMPTY_SUMMARY: TransactionSummary = { total: 0, locked: 0, processing: 0, bank_paid: 0 };

const GUEST_USER: TransactionUser = { global_id: '', name: '', user_type: 'guest', contact: '', profile_url: null };

// ── Helpers ────────────────────────────────────────────────────────────────────

const formatAmount = (n: number) =>
  `${new Intl.NumberFormat('en-US').format(n)} ៛`;

const StatusChip = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; cls: string }> = {
    pending:    { label: 'Pending',    cls: 'bg-[#f59e0b]/20 text-[#f59e0b]' },
    processing: { label: 'Processing', cls: 'bg-[#3b82f6]/20 text-[#3b82f6]' },
    paid:       { label: 'Paid',       cls: 'bg-[#22c55e]/20 text-[#22c55e]' },
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

  const [transactions, setTransactions] = useState<TransactionFromApi[]>([]);
  const [summary, setSummary] = useState<TransactionSummary>(EMPTY_SUMMARY);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [viewTx, setViewTx] = useState<TransactionFromApi | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTransactions = async (page: number) => {
    setIsLoading(true);
    try {
      const skip = (page - 1) * TAKE;
      const res = await transactionService.getTransactions(skip, TAKE);
      setTransactions(res.data.map((tx) => ({ ...tx, user: tx.user ?? GUEST_USER })));
      setSummary(res.summary);
      setTotal(res.total);
    } catch {
      showToast('Failed to load transactions', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(currentPage);
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus]);

  // Backend only accepts skip/take — search/status filter the current page only.
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

  const totalPages = Math.max(1, Math.ceil(total / TAKE));
  const skip = (currentPage - 1) * TAKE;
  const paginated = filtered;

  const handleExport = () => showToast(t.transactions.exportingMsg, 'success');

  const summaryCards = [
    { label: t.transactions.statusTotal,      value: formatAmount(summary.total),      color: 'text-[#3b82f6]' },
    { label: t.transactions.statusLocked,     value: formatAmount(summary.locked),     color: 'text-[#f59e0b]' },
    { label: t.transactions.statusProcessing, value: formatAmount(summary.processing), color: 'text-[#3b82f6]' },
    { label: t.transactions.statusBankPaid,   value: formatAmount(summary.bank_paid),  color: 'text-[#22c55e]' },
  ];

  const statusOptions = [
    { value: 'pending',    label: t.transactions.pending },
    { value: 'processing', label: 'Processing' },
    { value: 'paid',       label: 'Paid' },
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

          <StatusFilterDropdown
            label={t.transactions.status}
            allLabel={t.transactions.allStatus}
            selectedValue={selectedStatus}
            onSelect={setSelectedStatus}
            options={statusOptions}
          />
        </div>

        {/* Table */}
        <TableContainer>
          <TableHead>
            <Th>No.</Th>
            <Th>{t.transactions.account}</Th>
            <Th>Type</Th>
            <Th>{t.transactions.transactionId}</Th>
            <Th>{t.transactions.timestamp}</Th>
            <Th>{t.transactions.paymentMethod}</Th>
            <Th>{t.transactions.amount}</Th>
            <Th>{t.transactions.status}</Th>
            <Th align="center">{t.transactions.actions}</Th>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableMessageRow colSpan={9}>Loading...</TableMessageRow>
            ) : paginated.length === 0 ? (
              <TableMessageRow colSpan={9}>{t.transactions.noFound}</TableMessageRow>
            ) : (
              paginated.map((tx, i) => (
                <TableRow key={tx.global_id}>
                  <Td>{skip + i + 1}</Td>
                  <Td>
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
                  </Td>
                  <Td>
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                      tx.purchase_type === 'ticket'
                        ? 'bg-[#3b82f6]/20 text-[#3b82f6]'
                        : tx.purchase_type === 'product'
                        ? 'bg-[#22c55e]/20 text-[#22c55e]'
                        : 'bg-[#a855f7]/20 text-[#a855f7]'
                    }`}>
                      {tx.purchase_type === 'ticket' ? 'Movie' : tx.purchase_type === 'product' ? 'Product' : 'Plan'}
                    </span>
                  </Td>
                  <Td className="max-w-[140px]">
                    <p className="text-white text-xs font-mono font-semibold truncate" title={tx.transaction_id ?? ''}>
                      {tx.transaction_id ? `${tx.transaction_id.slice(0, 12)}…` : ''}
                    </p>
                    <p className="text-[#52525b] text-xs font-mono truncate" title={tx.global_id}>
                      {tx.global_id}
                    </p>
                  </Td>
                  <Td>
                    <span className="text-xs"><p>{tx.date}</p><p>{tx.time}</p></span>
                  </Td>
                  <Td>
                    <span className="inline-flex px-3 py-1.5 bg-[#27272a] text-white text-xs rounded-full font-medium capitalize">
                      {tx.payment_method.replace(/_/g, ' ')}
                    </span>
                  </Td>
                  <Td className="font-bold">{formatAmount(tx.amount)}</Td>
                  <Td>
                    <StatusChip status={tx.payment_status} />
                  </Td>
                  <Td align="center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setViewTx(tx)}
                        className="p-2 rounded-lg hover:bg-[#27272a] transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4 text-[#6C5CE7]" />
                      </button>
                    </div>
                  </Td>
                </TableRow>
              ))
            )}
          </TableBody>
        </TableContainer>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          disabled={isLoading}
          summary={<>{t.transactions.showing} <span className="text-white font-medium">{total > 0 ? skip + 1 : 0}</span> {t.transactions.to} <span className="text-white font-medium">{Math.min(skip + TAKE, total)}</span> {t.transactions.of} <span className="text-white font-medium">{total}</span> {t.transactions.entries}</>}
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
