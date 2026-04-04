import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, TrendingUp, Mic, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const BottomNav = () => {
  const { t } = useTranslation();

  const navItems = [
    { path: '/dashboard', icon: Home, label: t('nav.home'), exact: true },
    { path: '/dashboard/progress', icon: TrendingUp, label: t('nav.progress') },
    { path: '/dashboard/recite', icon: Mic, label: t('nav.recite') },
    { path: '/dashboard/review', icon: BookOpen, label: t('nav.review') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden px-4 pb-6 pt-2">
      <div className="mx-auto max-w-md bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-3xl shadow-2xl shadow-black/10 flex items-center justify-around p-2 relative overflow-hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-300 ${
                isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <item.icon className={`h-6 w-6 relative z-10 ${isActive ? 'scale-110' : 'scale-100'} transition-transform duration-300`} />
                <span className="text-[10px] font-bold uppercase tracking-tighter relative z-10">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
