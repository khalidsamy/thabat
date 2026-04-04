import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, TrendingUp, Mic, MessageCircle, BookOpen, User, Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const Sidebar = () => {
  const { t } = useTranslation();

  const navItems = [
    { path: '/dashboard', icon: Home, label: t('nav.home'), exact: true },
    { path: '/dashboard/progress', icon: TrendingUp, label: t('nav.progress') },
    { path: '/dashboard/recite', icon: Mic, label: t('nav.recite') },
    { path: '/dashboard/community', icon: MessageCircle, label: t('nav.community') },
    { path: '/dashboard/review', icon: BookOpen, label: t('nav.review') },
  ];

  const secondaryItems = [
    { path: '/profile', icon: User, label: t('nav.profile') },
    { path: '/settings', icon: Settings, label: t('nav.settings') || 'Settings' },
  ];

  return (
    <aside 
      className="hidden md:flex flex-col h-screen sticky top-0 left-0 z-40 bg-card dark:bg-card/50 border-e border-gray-100 dark:border-white/5 transition-all duration-300 w-20 lg:w-64 overflow-y-auto overflow-x-hidden group shrink-0"
      dir={t('dir') || (i18n.language === 'ar' ? 'rtl' : 'ltr')}
    >
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
          <span className="text-white font-black">ث</span>
        </div>
        <span className="hidden lg:block text-xl font-black text-foreground tracking-tighter uppercase">Thabat</span>
      </div>

      <nav className="flex-1 px-3 space-y-2 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `relative flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 group/item ${
                i18n.language === 'ar' ? 'flex-row-reverse' : 'flex-row'
              } ${
                isActive 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                  : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-600 dark:hover:text-slate-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`h-6 w-6 shrink-0 ${isActive ? 'scale-110' : 'scale-100'} transition-transform duration-300`} />
                <span className="hidden lg:block text-sm font-bold truncate opacity-0 lg:opacity-100 transition-opacity duration-300">
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeSidebar"
                    className="absolute left-0 w-1 h-6 bg-emerald-500 rounded-r-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 space-y-2 mb-8 border-t border-gray-100 dark:border-white/5 pt-6">
        {secondaryItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={`flex items-center gap-4 p-3 rounded-2xl text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-600 dark:hover:text-slate-200 transition-all duration-300 ${
              i18n.language === 'ar' ? 'flex-row-reverse text-right' : 'flex-row text-left'
            }`}
          >
            <item.icon className="h-6 w-6 shrink-0" />
            <span className="hidden lg:block text-sm font-bold truncate">
              {item.label}
            </span>
          </NavLink>
        ))}
        
        <button 
          onClick={() => {/* Logout logic */}}
          className={`w-full flex items-center gap-4 p-3 rounded-2xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 transition-all duration-300 ${
            i18n.language === 'ar' ? 'flex-row-reverse text-right' : 'flex-row text-left'
          }`}
        >
          <LogOut className="h-6 w-6 shrink-0" />
          <span className="hidden lg:block text-sm font-bold truncate">
            {t('navbar.logout')}
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
