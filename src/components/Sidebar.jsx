import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, TrendingUp, Mic, Headphones, MessageCircle, BookOpen, User, Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { t, i18n } = useTranslation();
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const isArabic = i18n.language === 'ar';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: Home, label: t('nav.home'), exact: true },
    { path: '/dashboard/progress', icon: TrendingUp, label: t('nav.progress') },
    { path: '/dashboard/recite', icon: Mic, label: t('nav.recite') },
    { path: '/dashboard/listen', icon: Headphones, label: isArabic ? 'الاستماع' : 'Listening Station' },
    { path: '/dashboard/community', icon: MessageCircle, label: t('nav.community') },
    { path: '/dashboard/review-session', icon: BookOpen, label: t('nav.review_sessions') },
  ];

  const secondaryItems = [
    { path: '/dashboard/errors', icon: TrendingUp, label: t('nav.errors') },
    { path: '/dashboard/profile', icon: User, label: t('nav.profile') },
    { path: '/dashboard/settings', icon: Settings, label: t('nav.settings') || 'Settings' },
  ];

  return (
    <aside 
      className={`hidden md:flex flex-col h-screen sticky top-0 z-40 border-[color:var(--theme-border)] bg-[color:var(--theme-surface-overlay)] backdrop-blur-xl transition-all duration-300 w-20 lg:w-64 overflow-y-auto overflow-x-hidden group shrink-0 ${
        i18n.language === 'ar' ? 'border-s shadow-[-10px_0_30px_rgba(15,23,42,0.08)]' : 'border-e shadow-[10px_0_30px_rgba(15,23,42,0.08)]'
      }`}
      dir={t('direction') || (i18n.language === 'ar' ? 'rtl' : 'ltr')}
    >
      <div className="p-6 flex items-center gap-4 overflow-hidden min-h-[80px]">
        <div className="shrink-0 group-hover:rotate-6 transition-transform">
           <img src="/ThabatLogo.png" alt="Thabat Logo" className="h-10 w-auto object-contain" />
        </div>
        <div className="hidden lg:flex flex-col opacity-0 lg:opacity-100 transition-opacity duration-300">
           <span className="text-xl font-black text-foreground tracking-tighter uppercase leading-none">Thabat</span>
           <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mt-1 leading-none">Holy Quran</span>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1.5 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `relative flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-300 group/item ${
                isActive 
                  ? 'bg-emerald-500/10 text-emerald-400 font-bold' 
                  : 'text-[color:var(--theme-text-muted)] hover:bg-[color:var(--theme-surface-muted)] hover:text-foreground'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`h-6 w-6 shrink-0 ${isActive ? 'scale-110' : 'scale-100'} transition-transform duration-300`} />
                <span className="hidden lg:block text-sm font-bold truncate transition-all duration-300">
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeSidebar"
                    className={`absolute ${i18n.language === 'ar' ? 'right-0 rounded-l-full' : 'left-0 rounded-r-full'} w-1 h-6 bg-emerald-500`}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 space-y-2 mb-8 border-t border-[color:var(--theme-border)] pt-6">
        {secondaryItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex items-center gap-4 p-3 rounded-2xl text-[color:var(--theme-text-muted)] hover:bg-[color:var(--theme-surface-muted)] hover:text-foreground transition-all duration-300"
          >
            <item.icon className="h-6 w-6 shrink-0" />
            <span className="hidden lg:block text-sm font-bold truncate">
              {item.label}
            </span>
          </NavLink>
        ))}
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-4 p-3 rounded-2xl text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 transition-all duration-300"
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
