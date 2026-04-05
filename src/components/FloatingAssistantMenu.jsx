import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import {
  Home, TrendingUp, Mic, MessageCircle,
  BookOpen, BookMarked, UserCircle, Plus, X, GitMerge,
} from 'lucide-react';

// All routes reachable from mobile — kept in sync with Sidebar.jsx
const NAV_ITEMS = [
  { path: '/dashboard',                icon: Home,          label: 'الرئيسية',  exact: true },
  { path: '/dashboard/progress',       icon: TrendingUp,    label: 'التقدم' },
  { path: '/dashboard/recite',         icon: Mic,           label: 'تسميع' },
  { path: '/dashboard/review-session', icon: BookOpen,      label: 'المراجعة' },
  { path: '/dashboard/errors',         icon: BookMarked,    label: 'الأخطاء' },
  { path: '/dashboard/mutashabihat',   icon: GitMerge,      label: 'المتشابهات' },
  { path: '/dashboard/community',      icon: MessageCircle, label: 'المجتمع' },
  { path: '/dashboard/profile',        icon: UserCircle,    label: 'الملف الشخصي' },
];

const itemVariants = {
  closed: { scale: 0.7, opacity: 0, y: 8 },
  open:   { scale: 1,   opacity: 1, y: 0  },
};

const FloatingAssistantMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <>
      {/* Backdrop — tapping outside closes the menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[65] bg-black/50 backdrop-blur-sm md:hidden"
            onClick={close}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[70] flex flex-col items-center gap-4 md:hidden">
        {/* Expanded navigation overlay */}
        <AnimatePresence>
          {isOpen && (
            <motion.nav
              key="menu"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0,  scale: 1 }}
              exit={{   opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="glass-assistive p-3 rounded-[2rem] flex flex-col gap-1 w-56"
            >
              {NAV_ITEMS.map((item, i) => (
                <motion.div
                  key={item.path}
                  variants={itemVariants}
                  initial="closed"
                  animate="open"
                  transition={{ delay: i * 0.04 }}
                >
                  <NavLink
                    to={item.path}
                    end={item.exact}
                    onClick={close}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                        isActive
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                          : 'text-zinc-400 hover:text-white hover:bg-white/5'
                      }`
                    }
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                </motion.div>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>

        {/* FAB trigger */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen((v) => !v)}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl border-2 border-white/15 transition-colors duration-300 relative overflow-hidden ${
            isOpen
              ? 'bg-rose-500 shadow-rose-500/40'
              : 'bg-emerald-500 shadow-emerald-500/40'
          }`}
        >
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.25, 0.08, 0.25] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className={`absolute inset-0 rounded-full ${isOpen ? 'bg-rose-300' : 'bg-emerald-300'}`}
          />
          <AnimatePresence mode="wait">
            {isOpen
              ? <motion.div key="x"    initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X    className="h-8 w-8 text-white relative z-10" /></motion.div>
              : <motion.div key="plus" initial={{ rotate:  90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate:-90, opacity: 0 }} transition={{ duration: 0.15 }}><Plus className="h-8 w-8 text-white relative z-10" /></motion.div>
            }
          </AnimatePresence>
        </motion.button>
      </div>
    </>
  );
};

export default FloatingAssistantMenu;