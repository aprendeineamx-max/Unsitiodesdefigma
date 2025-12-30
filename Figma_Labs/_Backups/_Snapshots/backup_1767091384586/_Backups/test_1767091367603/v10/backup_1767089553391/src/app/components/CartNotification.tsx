import { useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface CartNotificationProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export function CartNotification({ message, isVisible, onClose }: CartNotificationProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-white rounded-lg shadow-lg p-4 flex items-center gap-3 min-w-[300px] border-l-4 border-[#98ca3f]">
        <div className="flex-shrink-0">
          <CheckCircle2 className="w-6 h-6 text-[#98ca3f]" />
        </div>
        <p className="flex-1 text-gray-800">{message}</p>
        <button 
          onClick={onClose}
          className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
}
