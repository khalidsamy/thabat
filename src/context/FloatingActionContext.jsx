import React, { createContext, useContext, useState, useCallback } from 'react';

const FloatingActionContext = createContext();

export const FloatingActionProvider = ({ children }) => {
  const [elements, setElements] = useState({
    bottomLeft: [],
    bottomRight: [],
    topLeft: [],
    topRight: [],
  });

  const registerElement = useCallback((corner, id, element) => {
    setElements(prev => ({
      ...prev,
      [corner]: [...prev[corner].filter(e => e.id !== id), { id, element }]
    }));
  }, []);

  const unregisterElement = useCallback((corner, id) => {
    setElements(prev => ({
      ...prev,
      [corner]: prev[corner].filter(e => e.id !== id)
    }));
  }, []);

  return (
    <FloatingActionContext.Provider value={{ elements, registerElement, unregisterElement }}>
      {children}
    </FloatingActionContext.Provider>
  );
};

export const useFloatingActionStack = () => {
  const context = useContext(FloatingActionContext);
  if (!context) {
    throw new Error('useFloatingActionStack must be used within a FloatingActionProvider');
  }
  return context;
};
