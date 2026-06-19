import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import { Toast, subscribeToasts } from '../../utils/toast';

const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    return subscribeToasts(toast => {
      setToasts(prev => [...prev, toast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, 4000);
    });
  }, []);

  const dismiss = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          role="alert"
          className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm animate-slide-in ${
            toast.type === 'success'
              ? 'bg-white border-green-200 text-green-900'
              : 'bg-white border-red-200 text-red-900'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle size={18} className="text-green-600 shrink-0 mt-0.5" />
          ) : (
            <XCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
          )}
          <p className="flex-1 font-medium">{toast.message}</p>
          <button
            type="button"
            onClick={() => dismiss(toast.id)}
            className="text-gray-400 hover:text-gray-600 shrink-0"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
