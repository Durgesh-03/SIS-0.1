import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-success" />,
    error: <XCircle className="w-5 h-5 text-danger" />,
    info: <Info className="w-5 h-5 text-brand-primary" />
  };

  const bgColors = {
    success: 'bg-success/10 border-success/20',
    error: 'bg-danger/10 border-danger/20',
    info: 'bg-brand-primary/10 border-brand-primary/20'
  };

  return (
    <div className={`fixed bottom-4 right-4 flex items-center space-x-3 p-4 rounded-xl border glass-panel shadow-2xl animate-slide-up z-50 ${bgColors[type]}`}>
      {icons[type]}
      <span className="text-sm font-medium text-white pr-4">{message}</span>
      <button onClick={onClose} className="text-text-secondary hover:text-white transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
