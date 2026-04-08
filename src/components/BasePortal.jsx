import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * BasePortal
 * 🧬 MISSION: Cleanly mount components into the portal roots in index.html.
 * Handles SSR/CSR mismatch by ensuring document is available.
 */
const BasePortal = ({ children, targetId = 'modal-portal' }) => {
  const [mounted, setMounted] = useState(false);
  const [element, setElement] = useState(null);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (target) {
      setElement(target);
      setMounted(true);
    } else {
      console.warn(`Portal target #${targetId} not found. Ensure it exists in index.html.`);
    }
  }, [targetId]);

  return mounted && element ? createPortal(children, element) : null;
};

export default BasePortal;
