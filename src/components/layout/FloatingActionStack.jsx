import React from 'react';
import { createPortal } from 'react-dom';
import { useFloatingActionStack } from '../../context/FloatingActionContext';

const FloatingActionStack = () => {
  const { elements } = useFloatingActionStack();

  const renderCorner = (cornerElements) => {
    return cornerElements
      .sort((a, b) => (a.priority || 0) - (b.priority || 0))
      .map(item => <React.Fragment key={item.id}>{item.element}</React.Fragment>);
  };

  const content = (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ isolation: 'isolate', zIndex: 1000 }}>
      {/* Top Left Stack */}
      {elements.topLeft.length > 0 && (
        <div className="absolute top-6 left-6 flex flex-col items-start gap-3">
          {renderCorner(elements.topLeft)}
        </div>
      )}

      {/* Top Right Stack */}
      {elements.topRight.length > 0 && (
        <div className="absolute top-20 right-6 flex flex-col items-end gap-3 w-full max-w-sm">
          {renderCorner(elements.topRight)}
        </div>
      )}

      {/* Bottom Left Stack (The primary focus of the refactor) */}
      {elements.bottomLeft.length > 0 && (
        <div className="absolute bottom-6 left-6 flex flex-col-reverse items-center gap-3">
          {renderCorner(elements.bottomLeft)}
        </div>
      )}

      {/* Bottom Right Stack */}
      {elements.bottomRight.length > 0 && (
        <div className="absolute bottom-6 right-6 flex flex-col-reverse items-end gap-3">
          {renderCorner(elements.bottomRight)}
        </div>
      )}
    </div>
  );

  return createPortal(content, document.body);
};

export default FloatingActionStack;
