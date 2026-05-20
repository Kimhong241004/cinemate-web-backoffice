import { useEffect, useRef } from 'react';
import { X, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

type Variant = 'danger' | 'warning' | 'info';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Variant;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const variantStyles: Record<Variant, { icon: React.ReactNode; confirmBtn: string; iconBg: string }> = {
  danger: {
    icon: <ShieldAlert className="w-6 h-6 text-[#ef4444]" />,
    iconBg: 'bg-[rgba(239,68,68,0.12)]',
    confirmBtn: 'bg-[#ef4444] hover:bg-[#dc2626]',
  },
  warning: {
    icon: <AlertTriangle className="w-6 h-6 text-[#f97316]" />,
    iconBg: 'bg-[rgba(249,115,22,0.12)]',
    confirmBtn: 'bg-gradient-to-r from-[#ef4444] to-[#f97316] hover:opacity-90',
  },
  info: {
    icon: <Info className="w-6 h-6 text-[#3b82f6]" />,
    iconBg: 'bg-[rgba(59,130,246,0.12)]',
    confirmBtn: 'bg-[#3b82f6] hover:bg-[#2563eb]',
  },
};

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const styles = variantStyles[variant];

  // Focus cancel button when dialog opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => cancelRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onCancel();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, loading, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => !loading && onCancel()}
      />

      {/* Dialog */}
      <div className="relative bg-[#18181b] border border-[#27272a] rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in">
        {/* Close button */}
        <button
          onClick={onCancel}
          disabled={loading}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#71717a] hover:text-white hover:bg-[#27272a] transition-colors disabled:opacity-40"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon + Title */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl ${styles.iconBg}`}>
            {styles.icon}
          </div>
          <div className="pt-1">
            <h2 id="confirm-title" className="text-white text-lg font-bold leading-snug">
              {title}
            </h2>
          </div>
        </div>

        {/* Message */}
        <p className="text-[#a1a1aa] text-sm leading-relaxed mb-6 pl-16">
          {message}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            ref={cancelRef}
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-[#27272a] text-white text-sm font-medium hover:bg-[#3f3f46] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${styles.confirmBtn}`}
          >
            {loading && (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
