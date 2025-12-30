import { X, Check, Bell, Trash2, CheckCheck } from 'lucide-react';
import { useNotifications } from '../context/NotificationsContext';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    clearAll,
    requestPermission 
  } = useNotifications();

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Ahora';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Hace ${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Hace ${days}d`;
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'course': return '🎓';
      case 'message': return '💬';
      default: return 'ℹ️';
    }
  };

  const getColorClass = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'course': return 'bg-blue-50 border-blue-200';
      case 'message': return 'bg-purple-50 border-purple-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="bg-[#121f3d] text-white p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Notificaciones</h2>
              {unreadCount > 0 && (
                <span className="bg-[#98ca3f] text-[#121f3d] text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="flex-1 text-xs bg-white/10 hover:bg-white/20 px-3 py-2 rounded transition-colors flex items-center justify-center gap-1"
              >
                <CheckCheck className="w-3 h-3" />
                Marcar todas
              </button>
            )}
            {notifications.length > 0 && (
              <button 
                onClick={clearAll}
                className="flex-1 text-xs bg-white/10 hover:bg-white/20 px-3 py-2 rounded transition-colors flex items-center justify-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Limpiar todo
              </button>
            )}
            <button 
              onClick={requestPermission}
              className="text-xs bg-[#98ca3f] text-[#121f3d] px-3 py-2 rounded hover:bg-[#87b935] transition-colors"
            >
              Activar Push
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <Bell className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay notificaciones</h3>
              <p className="text-sm text-gray-600">
                Te notificaremos cuando haya algo nuevo
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-4 transition-colors ${
                    notification.read ? 'bg-white' : 'bg-blue-50'
                  } hover:bg-gray-50`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl flex-shrink-0">
                      {notification.icon || getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          <X className="w-3 h-3 text-gray-500" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(notification.timestamp)}
                        </span>
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs text-[#98ca3f] hover:underline flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            Marcar leída
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
