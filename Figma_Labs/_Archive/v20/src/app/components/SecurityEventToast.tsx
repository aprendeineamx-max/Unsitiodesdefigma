import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { securityService, type SecurityEvent } from '../services/security';

export function SecurityEventToast() {
  const [recentEvent, setRecentEvent] = useState<SecurityEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Interceptar nuevos eventos
    const checkForNewEvents = () => {
      const events = securityService.getSecurityEvents();
      if (events.length > 0) {
        const latest = events[0];
        
        // Solo mostrar si es un evento nuevo (menos de 2 segundos)
        if (Date.now() - latest.timestamp < 2000) {
          setRecentEvent(latest);
          setShow(true);
          
          // Auto-ocultar después de 5 segundos
          setTimeout(() => {
            setShow(false);
          }, 5000);
        }
      }
    };

    const interval = setInterval(checkForNewEvents, 500);
    return () => clearInterval(interval);
  }, []);

  if (!show || !recentEvent) return null;

  const getIcon = () => {
    switch (recentEvent.severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />;
      case 'medium':
        return <Info className="h-5 w-5 text-yellow-500 flex-shrink-0" />;
      default:
        return <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0" />;
    }
  };

  const getColors = () => {
    switch (recentEvent.severity) {
      case 'critical':
        return 'bg-red-900/90 border-red-700';
      case 'high':
        return 'bg-orange-900/90 border-orange-700';
      case 'medium':
        return 'bg-yellow-900/90 border-yellow-700';
      default:
        return 'bg-blue-900/90 border-blue-700';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] animate-in slide-in-from-bottom-5">
      <div className={`flex items-start gap-3 p-4 rounded-lg border ${getColors()} shadow-2xl max-w-md backdrop-blur-sm`}>
        {getIcon()}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white mb-1">
            Nuevo Evento de Seguridad
          </p>
          <p className="text-xs text-slate-200">
            {recentEvent.message}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2 py-0.5 bg-white/10 rounded text-white">
              {recentEvent.type}
            </span>
            <span className="text-xs px-2 py-0.5 bg-white/10 rounded text-white">
              {recentEvent.severity}
            </span>
          </div>
        </div>
        <button
          onClick={() => setShow(false)}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <XCircle className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
