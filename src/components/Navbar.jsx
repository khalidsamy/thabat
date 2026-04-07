import React, { useContext } from 'react';
import { LogOut, Globe, UserCircle2, BookMarked, Brain, GitMerge, Menu, X, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const menuItems = [
    { path: '/dashboard/errors', icon: BookMarked, label: t('nav.errors'), color: 'text-red-500' },
    { path: '/dashboard/review-session', icon: Brain, label: t('nav.review_sessions'), color: 'text-emerald-500' },
    { path: '/dashboard/mutashabihat', icon: GitMerge, label: t('nav.mutashabihat'), color: 'text-teal-500' },
    { path: '/dashboard/profile', icon: UserCircle2, label: t('nav.profile'), color: 'text-blue-500' },
    { path: '/dashboard/settings', icon: Settings, label: t('nav.settings'), color: 'text-slate-500' },
  ];

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(nextLang);
  };

  if (!user) return null;

  return (
    <nav className="sticky top-0 z-50 border-b border-[color:var(--theme-border)] bg-[color:var(--theme-surface-overlay)] shadow-[0_12px_40px_rgba(15,23,42,0.14)] backdrop-blur-xl transition-all duration-500">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex justify-between items-center h-20">
          
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-3 group">
               <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/30 group-hover:scale-105 transition-transform duration-500">
                  <span className="text-white font-black text-2xl">ث</span>
               </div>
              <span className="font-black text-2xl tracking-tighter text-foreground group-hover:text-emerald-400 transition-colors hidden sm:block uppercase">
                {t('navbar.app_name')}
              </span>
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-2 mx-8 rounded-3xl border border-[color:var(--theme-border)] bg-[color:var(--theme-surface-muted)] p-1.5">
            {menuItems.slice(0, 3).map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `flex items-center gap-3 px-6 py-3 rounded-2xl text-sm font-black transition-all duration-500 uppercase tracking-widest ${
                  isActive 
                    ? `bg-[color:var(--theme-surface-elevated)] shadow-lg shadow-black/10 ${item.color} scale-100`
                    : 'text-[color:var(--theme-text-muted)] hover:text-foreground'
                }`}
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`h-4 w-4 ${isActive ? item.color : 'text-[color:var(--theme-text-muted)]'}`} />
                    {item.label}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            
            <button 
              onClick={toggleLanguage} 
              className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-black text-[color:var(--theme-text-muted)] hover:bg-[color:var(--theme-surface-muted)] transition-all uppercase tracking-widest"
              aria-label="Toggle Language"
            >
              <Globe className="h-4 w-4 text-emerald-500" />
              <span className="hidden sm:inline">{i18n.language === 'en' ? 'Arabic' : 'English'}</span>
            </button>
            
            <Link 
              to="/dashboard/profile"
              className="hidden md:flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-2xl border border-[color:var(--theme-border)] bg-[color:var(--theme-surface-muted)] hover:border-emerald-500/30 transition-all group"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[color:var(--theme-surface-elevated)] shadow-lg shadow-black/10">
                <span className="font-black text-sm uppercase text-foreground">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <span className="text-sm font-black text-foreground group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{user?.name}</span>
            </Link>

            <button 
              onClick={logout}
              className="hidden lg:flex items-center justify-center p-3 rounded-2xl text-[color:var(--theme-text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-all"
              title={t('navbar.logout')}
            >
              <LogOut className="h-5 w-5 rtl:rotate-180" />
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden rounded-2xl border border-[color:var(--theme-border)] bg-[color:var(--theme-surface-elevated)] p-3 text-foreground shadow-xl shadow-black/10 active:scale-95 transition-all"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-[100] h-screen w-screen backdrop-blur-sm lg:hidden"
              style={{ background: 'var(--theme-backdrop)' }}
            />
            <motion.div
              initial={{ x: i18n.language === 'ar' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: i18n.language === 'ar' ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={`fixed inset-y-0 ${i18n.language === 'ar' ? 'right-0' : 'left-0'} z-[101] flex h-screen w-80 flex-col border-x border-[color:var(--theme-border)] bg-[color:var(--theme-surface-overlay)] p-8 shadow-2xl backdrop-blur-3xl lg:hidden`}
            >
              <div className="flex items-center justify-between mb-10">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                       <span className="text-white font-black text-xl">ث</span>
                    </div>
                    <span className="font-black text-xl text-foreground tracking-tight">Thabat</span>
                 </div>
                 <button onClick={() => setIsMenuOpen(false)} className="rounded-xl bg-[color:var(--theme-surface-muted)] p-2.5 text-[color:var(--theme-text-muted)] hover:text-foreground transition-all">
                    <X className="h-6 w-6" />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto -mx-2 px-2 py-4 space-y-3">
                <div className="mb-3 flex items-center justify-between px-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] italic text-[color:var(--theme-text-muted)]">Navigation</p>
                  <ThemeToggle className="!px-3 !py-2" />
                </div>
                {menuItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) => `flex items-center gap-5 p-5 rounded-[1.5rem] text-sm font-bold transition-all duration-300 ${
                      isActive 
                        ? `bg-emerald-500/10 ${item.color} shadow-sm border border-emerald-500/10 scale-[1.02]` 
                        : 'text-[color:var(--theme-text-muted)] hover:bg-[color:var(--theme-surface-muted)]'
                    }`}
                  >
                    {({ isActive }) => (
                      <>
                        <div className={`p-2.5 rounded-xl ${isActive ? 'bg-[color:var(--theme-surface-elevated)] shadow-sm' : 'bg-transparent'}`}>
                          <item.icon className="h-5 w-5" />
                        </div>
                        {item.label}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>

              <div className="mt-auto pt-8 border-t border-[color:var(--theme-border)] space-y-4">
                 <button 
                   onClick={logout}
                   className="w-full flex items-center justify-center gap-3 p-5 rounded-[1.5rem] text-sm font-black text-white bg-rose-500 hover:bg-rose-600 shadow-xl shadow-rose-500/20 active:scale-95 transition-all"
                 >
                   <LogOut className="h-5 w-5 rtl:rotate-180" />
                   {t('navbar.logout')}
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
