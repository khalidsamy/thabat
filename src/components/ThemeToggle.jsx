import { motion } from 'framer-motion';
import { Moon, SunMedium } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <motion.button
      type="button"
      whileHover={{ y: -1, scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`theme-toggle ${className}`.trim()}
    >
      <span className="theme-toggle__track">
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 450, damping: 34 }}
          className="theme-toggle__thumb"
        >
          {isDark ? <Moon className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
        </motion.span>
      </span>
      <span className="hidden sm:inline">{isDark ? 'Dark' : 'Light'}</span>
    </motion.button>
  );
};

export default ThemeToggle;
