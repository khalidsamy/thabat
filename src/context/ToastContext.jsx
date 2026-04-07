import React, { createContext, useState, useCallback, useContext, useEffect, useRef } from 'react';

export const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const toastCounterRef = useRef(0);
  const timeoutRefs = useRef(new Map());

  useEffect(() => () => {
    timeoutRefs.current.forEach((timeoutId) => clearTimeout(timeoutId));
    timeoutRefs.current.clear();
  }, []);

  const addToast = useCallback((message, type) => {
    toastCounterRef.current += 1;
    const id = toastCounterRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-dismiss smoothly after 4 seconds
    const timeoutId = setTimeout(() => {
      timeoutRefs.current.delete(id);
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);

    timeoutRefs.current.set(id, timeoutId);
  }, []);

  const showSuccess = useCallback((message) => addToast(message, 'success'), [addToast]);
  const showError = useCallback((message) => addToast(message, 'error'), [addToast]);
  const showInfo = useCallback((message) => addToast(message, 'info'), [addToast]);

  const removeToast = useCallback((id) => {
    const timeoutId = timeoutRefs.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutRefs.current.delete(id);
    }
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const value = {
    toasts,
    showSuccess,
    showError,
    showInfo,
    removeToast
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

// Standardized hook for clean ingestion
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used strictly within a ToastProvider tree");
  }
  return context;
};
