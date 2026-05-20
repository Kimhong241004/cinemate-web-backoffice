import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const ToastContainer = () => {
  const { toasts } = useNotification();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto
            min-w-[300px] max-w-[400px]
            bg-[#18181b] border rounded-lg shadow-xl
            px-4 py-3 flex items-start gap-3
            animate-[slideIn_0.3s_ease-out]
            ${
              toast.type === 'success'
                ? 'border-[#22c55e]'
                : toast.type === 'error'
                ? 'border-[#ef4444]'
                : toast.type === 'warning'
                ? 'border-[#f59e0b]'
                : 'border-[#3b82f6]'
            }
          `}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-[#22c55e] flex-shrink-0 mt-0.5" />
          ) : toast.type === 'error' ? (
            <XCircle className="w-5 h-5 text-[#ef4444] flex-shrink-0 mt-0.5" />
          ) : toast.type === 'warning' ? (
            <AlertCircle className="w-5 h-5 text-[#f59e0b] flex-shrink-0 mt-0.5" />
          ) : (
            <Info className="w-5 h-5 text-[#3b82f6] flex-shrink-0 mt-0.5" />
          )}
          <p className="text-sm text-white flex-1">{toast.message}</p>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
