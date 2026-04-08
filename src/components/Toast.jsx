import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useFloatingActionStack } from '../context/FloatingActionContext';

const ToastItem = ({ toast, removeToast }) => {
  let bgColor = '';
  let icon = null;

  if (toast.type === 'success') {
    bgColor = 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200';
    icon = <CheckCircle className="h-5 w-5 text-emerald-500 mr-3" />;
  } else if (toast.type === 'error') {
    bgColor = 'bg-red-950/40 border-red-500/50 text-rose-200';
    icon = <AlertCircle className="h-5 w-5 text-rose-500 mr-3" />;
  } else {
    bgColor = 'bg-blue-950/40 border-blue-500/50 text-blue-200';
    icon = <Info className="h-5 w-5 text-blue-500 mr-3" />;
  }

  return (
    <div
      className={`flex items-center p-4 border-l-4 rounded-md shadow-lg pointer-events-auto transform transition-all duration-300 ease-in-out hover:shadow-xl backdrop-blur-md ${bgColor}`}
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
        className="flex-shrink-0 text-slate-500 hover:text-slate-200 transition-colors focus:outline-none p-1 rounded-full hover:bg-white/10"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

const Toast = () => {
  const { toasts, removeToast } = useToast();
  const { registerElement, unregisterElement } = useFloatingActionStack();

  const content = (
    <div className="flex flex-col space-y-3 pointer-events-none w-full max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
      ))}
    </div>
  );

  useEffect(() => {
    if (toasts.length > 0) {
      registerElement('topRight', 'global-toasts', content);
    } else {
      unregisterElement('topRight', 'global-toasts');
    }
    return () => unregisterElement('topRight', 'global-toasts');
  }, [toasts, registerElement, unregisterElement, content]);

  return null;
};

export default Toast;
