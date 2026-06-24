import { CheckCircle2, XCircle, AlertCircle, Info, X, Trash2 } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';

interface NotificationPanelProps {
  onClose: () => void;
}

const NotificationPanel = ({ onClose }: NotificationPanelProps) => {
  const { notifications, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications } = useNotification();
  const { t } = useLanguage();

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="absolute top-[65px] right-2 sm:right-4 lg:right-6 w-[90vw] sm:w-[400px] bg-[#18181b] border border-[rgba(255,255,255,0.1)] rounded-xl shadow-xl overflow-hidden z-20">
      {/* Header */}
      <div className="border-b border-[rgba(255,255,255,0.1)] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-white text-sm font-bold">Notifications</h3>
          {notifications.filter((n) => !n.read).length > 0 && (
            <span className="bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] text-white text-xs px-2 py-0.5 rounded-full">
              {notifications.filter((n) => !n.read).length}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-[rgba(255,255,255,0.05)] rounded transition-colors"
        >
          <X className="w-4 h-4 text-[#71717B]" />
        </button>
      </div>

      {/* Actions */}
      {notifications.length > 0 && (
        <div className="border-b border-[rgba(255,255,255,0.1)] px-4 py-2 flex items-center justify-between">
          <button
            onClick={markAllAsRead}
            className="text-xs text-[#3b82f6] hover:text-[#60a5fa] transition-colors"
          >
            Mark all as read
          </button>
          <button
            onClick={clearAllNotifications}
            className="text-xs text-[#6C5CE7] hover:text-[#FF2E63] transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            Clear all
          </button>
        </div>
      )}

      {/* Notification List */}
      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Info className="w-12 h-12 text-[#71717B] mx-auto mb-3" />
            <p className="text-[#71717B] text-sm">No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-[rgba(255,255,255,0.1)]">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`
                  px-4 py-3 hover:bg-[rgba(255,255,255,0.02)] transition-colors cursor-pointer
                  ${!notification.read ? 'bg-[rgba(59,130,246,0.05)]' : ''}
                `}
                onClick={() => {
                  if (!notification.read) {
                    markAsRead(notification.id);
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {notification.type === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 text-[#22c55e]" />
                    ) : notification.type === 'error' ? (
                      <XCircle className="w-5 h-5 text-[#FF2E63]" />
                    ) : notification.type === 'warning' ? (
                      <AlertCircle className="w-5 h-5 text-[#f59e0b]" />
                    ) : (
                      <Info className="w-5 h-5 text-[#3b82f6]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-white text-sm font-medium">{notification.title}</h4>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-[#3b82f6] rounded-full flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-[#a1a1aa] text-xs mt-1">{notification.message}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[#71717B] text-xs">{formatTimestamp(notification.timestamp)}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="p-1 hover:bg-[rgba(255,255,255,0.05)] rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3 text-[#71717B] hover:text-[#ef4444]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
