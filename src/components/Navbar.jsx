import React, { useContext } from 'react';
import { Moon, Sun, LogOut, Globe, UserCircle2, BookMarked, Brain, GitMerge, Menu, X, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const menuItems = [
    { path: '/dashboard/errors', icon: BookMarked, label: t('nav.errors'), color: 'text-red-500' },
    { path: '/dashboard/review-session', icon: Brain, label: t('nav.review_sessions'), color: 'text-emerald-500' },
    { path: '/dashboard/mutashabihat', icon: GitMerge, label: t('nav.mutashabihat'), color: 'text-teal-500' },
    { path: '/dashboard/profile', icon: UserCircle2, label: t('nav.profile'), color: 'text-blue-500' },
    { path: '/dashboard/settings', icon: Settings, label: t('nav.settings'), color: 'text-slate-500' },
  ];

  // If there's no user, we don't render the connected Navbar (can keep a public one later if desired)
  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(nextLang);
  };

  if (!user) return null;

  return (
    <nav className="bg-white/60 dark:bg-card/60 backdrop-blur-md border-b border-slate-200 dark:border-white/5 transition-all duration-500 sticky top-0 z-50 shadow-sm shadow-slate-200/20">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex justify-between items-center h-20">
          
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-3 group">
               <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/30 group-hover:scale-105 transition-transform duration-500">
                  <span className="text-white font-black text-2xl">ث</span>
               </div>
              <span className="font-black text-2xl tracking-tighter text-zinc-950 dark:text-foreground group-hover:text-emerald-600 transition-colors hidden sm:block uppercase">
                {t('navbar.app_name')}
              </span>
            </Link>
          </div>

          {/* Center Nav Links (desktop only) */}
          <div className="hidden lg:flex items-center gap-2 mx-8 bg-slate-50 dark:bg-white/5 p-1.5 rounded-3xl border border-slate-200 dark:border-white/5">
            {menuItems.slice(0, 3).map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `flex items-center gap-3 px-6 py-3 rounded-2xl text-sm font-black transition-all duration-500 uppercase tracking-widest ${
                  isActive 
                    ? `bg-white dark:bg-zinc-950 shadow-lg shadow-slate-200/50 dark:shadow-black/20 ${item.color} scale-100` 
                    : 'text-zinc-400 dark:text-slate-500 hover:text-zinc-950'
                }`}
              >
                <item.icon className={`h-4 w-4 ${isActive ? item.color : 'text-zinc-300'}`} />
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Language Switcher */}
            <button 
              onClick={toggleLanguage} 
              className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-black text-zinc-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-all uppercase tracking-widest"
              aria-label="Toggle Language"
            >
              <Globe className="h-4 w-4 text-emerald-600" />
              <span className="hidden sm:inline">{i18n.language === 'en' ? 'Arabic' : 'English'}</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-3 rounded-2xl text-zinc-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-all shadow-inner"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode
                ? <Sun className="h-5 w-5 text-yellow-500" />
                : <Moon className="h-5 w-5 text-zinc-950" />}
            </button>
            
            {/* User Profile Badge */}
            <Link 
              to="/dashboard/profile"
              className="hidden md:flex items-center gap-3 pl-2 pr-4 py-1.5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 hover:border-emerald-500/30 transition-all group"
            >
              <div className="w-9 h-9 bg-zinc-950 dark:bg-white rounded-xl flex items-center justify-center shadow-lg shadow-black/10">
                <span className="text-white dark:text-zinc-950 font-black text-sm uppercase">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <span className="text-sm font-black text-zinc-950 dark:text-foreground group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{user?.name}</span>
            </Link>

            {/* Logout Mechanism */}
            <button 
              onClick={logout}
              className="hidden lg:flex items-center justify-center p-3 text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all"
              title={t('navbar.logout')}
            >
              <LogOut className="h-5 w-5 rtl:rotate-180" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-3 rounded-2xl bg-zinc-950 text-white shadow-xl shadow-zinc-950/20 active:scale-95 transition-all"
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
              className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm lg:hidden h-screen w-screen"
            />
            <motion.div
              initial={{ x: i18n.language === 'ar' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: i18n.language === 'ar' ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={`fixed inset-y-0 ${i18n.language === 'ar' ? 'right-0' : 'left-0'} w-80 z-[101] bg-white/95 dark:bg-card/95 backdrop-blur-3xl border-x border-zinc-200 dark:border-white/10 p-8 lg:hidden shadow-2xl flex flex-col h-screen`}
            >
              <div className="flex items-center justify-between mb-10">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                       <span className="text-white font-black text-xl">ث</span>
                    </div>
                    <span className="font-black text-xl text-foreground tracking-tight">Thabat</span>
                 </div>
                 <button onClick={() => setIsMenuOpen(false)} className="p-2.5 bg-gray-100 dark:bg-white/5 rounded-xl text-slate-400 hover:text-foreground transition-all">
                    <X className="h-6 w-6" />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto -mx-2 px-2 py-4 space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-4 italic">Navigation</p>
                {menuItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) => `flex items-center gap-5 p-5 rounded-[1.5rem] text-sm font-bold transition-all duration-300 ${
                      isActive 
                        ? `bg-emerald-500/10 ${item.color} shadow-sm border border-emerald-500/10 scale-[1.02]` 
                        : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl ${isActive ? 'bg-white shadow-sm' : 'bg-transparent'}`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    {item.label}
                  </NavLink>
                ))}
              </div>

              <div className="mt-auto pt-8 border-t border-white/5 space-y-4">
                 <button 
                   onClick={() => { toggleTheme(); setIsMenuOpen(false); }}
                   className="w-full flex items-center gap-5 p-5 rounded-[1.5rem] text-sm font-bold text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                 >
                   <div className="p-2.5 bg-yellow-500/10 rounded-xl">
                      {isDarkMode ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-slate-400" />}
                   </div>
                   {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                 </button>
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
