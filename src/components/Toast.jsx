import React from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Toast = () => {
  const { toasts, removeToast } = useToast();

  if (!toasts.length) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col space-y-3 pointer-events-none w-full max-w-sm">
      {toasts.map((toast) => {
        let bgColor = '';
        let icon = null;

        if (toast.type === 'success') {
          bgColor = 'bg-emerald-50 border-emerald-500 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-500/50 dark:text-emerald-200';
          icon = <CheckCircle className="h-5 w-5 text-emerald-500 mr-3" />;
        } else if (toast.type === 'error') {
          bgColor = 'bg-red-50 border-red-500 text-red-800 dark:bg-red-950/40 dark:border-red-500/50 dark:text-red-200';
          icon = <AlertCircle className="h-5 w-5 text-red-500 mr-3" />;
        } else {
          bgColor = 'bg-blue-50 border-blue-500 text-blue-800 dark:bg-blue-950/40 dark:border-blue-500/50 dark:text-blue-200';
          icon = <Info className="h-5 w-5 text-blue-500 mr-3" />;
        }

        return (
          <div
            key={toast.id}
            className={`flex items-center p-4 border-l-4 rounded-md shadow-lg pointer-events-auto transform transition-all duration-300 ease-in-out hover:shadow-xl ${bgColor}`}
            style={{ 
              animation: 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' 
            }}
          >
            <style>{`
              @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
              }
            `}</style>
            
            {icon}
            
            <div className="flex-1 mr-4">
              <p className="text-sm font-semibold tracking-tight">{toast.message}</p>
            </div>
            
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors focus:outline-none p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Toast;
