import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import {
  Home, TrendingUp, Mic, MessageCircle,
  BookOpen, BookMarked, UserCircle, Plus, X, GitMerge,
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard',                icon: Home,          label: 'الرئيسية',     exact: true },
  { path: '/dashboard/recite',         icon: Mic,           label: 'تسميع' },
  { path: '/dashboard/review-session', icon: BookOpen,      label: 'المراجعة' },
  { path: '/dashboard/errors',         icon: BookMarked,    label: 'الأخطاء' },
  { path: '/dashboard/mutashabihat',   icon: GitMerge,      label: 'المتشابهات' },
  { path: '/dashboard/progress',       icon: TrendingUp,    label: 'التقدم' },
  { path: '/dashboard/community',      icon: MessageCircle, label: 'المجتمع' },
  { path: '/dashboard/profile',        icon: UserCircle,    label: 'الملف الشخصي' },
];

const FloatingAssistantMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <>
      {/* Full-screen backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="fab-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[65] md:hidden"
            style={{ backdropFilter: 'blur(12px)', background: 'rgba(11, 17, 32, 0.75)' }}
            onClick={close}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-7 left-1/2 -translate-x-1/2 z-[70] flex flex-col items-center gap-4 md:hidden">
        {/* Navigation overlay */}
        <AnimatePresence>
          {isOpen && (
            <motion.nav
              key="fab-menu"
              initial={{ opacity: 0, y: 16, scale: 0.92 }}
              animate={{ opacity: 1, y: 0,  scale: 1 }}
              exit={{   opacity: 0, y: 16, scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 340, damping: 30 }}
              className="flex flex-col gap-1 p-3 rounded-[1.75rem] w-52 overflow-hidden"
              style={{
                background: 'rgba(15, 22, 40, 0.82)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}
            >
              {NAV_ITEMS.map((item, i) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.035, type: 'spring', stiffness: 300 }}
                >
                  <NavLink
                    to={item.path}
                    end={item.exact}
                    onClick={close}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                        isActive
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                          : 'text-zinc-400 hover:text-white hover:bg-white/6'
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

        {/* FAB button */}
        <motion.button
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.88 }}
          onClick={() => setIsOpen(v => !v)}
          aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
          className="w-14 h-14 rounded-full flex items-center justify-center border border-white/15 relative overflow-hidden"
          style={{
            background: isOpen
              ? 'linear-gradient(135deg, #f43f5e, #e11d48)'
              : 'linear-gradient(135deg, #10b981, #059669)',
            boxShadow: isOpen
              ? '0 8px 30px rgba(244,63,94,0.45)'
              : '0 8px 30px rgba(16,185,129,0.45)',
          }}
        >
          {/* Ambient glow ring */}
          <motion.span
            animate={{ scale: [1, 1.6, 1], opacity: [0.2, 0.06, 0.2] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full"
            style={{ background: isOpen ? '#f43f5e' : '#34d399' }}
          />
          <AnimatePresence mode="wait">
            {isOpen
              ? <motion.div key="x" initial={{ rotate: -80, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 80, opacity: 0 }} transition={{ duration: 0.14 }}><X    className="h-7 w-7 text-white relative z-10" /></motion.div>
              : <motion.div key="p" initial={{ rotate:  80, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate:-80, opacity: 0 }} transition={{ duration: 0.14 }}><Plus className="h-7 w-7 text-white relative z-10" /></motion.div>
            }
          </AnimatePresence>
        </motion.button>
      </div>
    </>
  );
};

export default FloatingAssistantMenu;