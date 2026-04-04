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
    <nav className="bg-card border-b border-gray-100 dark:border-gray-800 transition-colors duration-300 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
               <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                  <span className="text-white font-black text-xl">ث</span>
               </div>
              <span className="font-extrabold text-xl tracking-tight text-foreground group-hover:text-primary transition-colors hidden sm:block">
                {t('navbar.app_name')}
              </span>
            </Link>
          </div>          {/* Center Nav Links (desktop only) */}
          <div className="hidden lg:flex items-center gap-1 mx-8">
            {menuItems.slice(0, 3).map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                  isActive 
                    ? `bg-emerald-500/10 ${item.color} shadow-sm border border-emerald-500/10 scale-105` 
                    : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-600'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            
            {/* Language Switcher */}
            <button 
              onClick={toggleLanguage} 
              className="flex items-center gap-2 p-2 rounded-lg text-sm font-bold text-secondary-foreground hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle Language"
            >
              <Globe className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline uppercase tracking-widest">{i18n.language === 'en' ? 'عربي' : 'EN'}</span>
            </button>

            {/* Dark Mode Toggle — always visible, ring on hover */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-secondary-foreground hover:bg-gray-100 dark:hover:bg-gray-800 hover:ring-2 ring-gray-200 dark:ring-gray-700 transition-all"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDarkMode ? 'Light mode' : 'Dark mode'}
            >
              {isDarkMode
                ? <Sun className="h-5 w-5 text-yellow-400" />
                : <Moon className="h-5 w-5 text-slate-600 dark:text-slate-300" />}
            </button>
            
            {/* User Profile Badge → clickable link to /profile */}
            <Link 
              to="/profile"
              className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
              title="My Profile"
            >
              <div className="w-8 h-8 shadow-inner bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center border border-primary/20 group-hover:border-primary/50 transition-colors">
                <span className="text-primary font-bold text-sm">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <span className="text-sm font-medium text-foreground truncate max-w-[120px] group-hover:text-primary transition-colors">{user?.name}</span>
            </Link>

            {/* Mobile: icon-only profile link */}
            <Link
              to="/profile"
              className="sm:hidden p-2 rounded-full text-secondary-foreground hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Profile"
            >
              <UserCircle2 className="h-5 w-5" />
            </Link>

            {/* Logical Separator */}
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>

            {/* Logout Mechanism */}
            <button 
              onClick={logout}
              className="hidden sm:flex group items-center gap-1.5 text-sm font-bold text-slate-400 hover:text-rose-500 transition-colors px-4 py-2 rounded-xl hover:bg-rose-500/10"
            >
              <LogOut className="h-4 w-4 rtl:rotate-180" />
              <span>{t('navbar.logout')}</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: i18n.language === 'ar' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: i18n.language === 'ar' ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed inset-y-0 ${i18n.language === 'ar' ? 'right-0' : 'left-0'} w-72 z-50 bg-card/90 backdrop-blur-xl border-x border-white/10 p-6 lg:hidden shadow-2xl flex flex-col`}
            >
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                       <span className="text-white font-black text-lg">ث</span>
                    </div>
                    <span className="font-bold text-foreground">Menu</span>
                 </div>
                 <button onClick={() => setIsMenuOpen(false)} className="p-2 text-slate-400 hover:text-foreground transition-colors">
                    <X className="h-5 w-5" />
                 </button>
              </div>

              <nav className="flex-1 space-y-2">
                {menuItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) => `flex items-center gap-4 p-4 rounded-2xl text-sm font-bold transition-all ${
                      isActive 
                        ? `bg-emerald-500/10 ${item.color} shadow-sm border border-emerald-500/10` 
                        : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <div className="pt-6 border-t border-white/5 space-y-4">
                 <button 
                   onClick={() => { toggleTheme(); setIsMenuOpen(false); }}
                   className="w-full flex items-center gap-4 p-4 rounded-2xl text-sm font-bold text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                 >
                   {isDarkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5" />}
                   {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                 </button>
                 <button 
                   onClick={logout}
                   className="w-full flex items-center gap-4 p-4 rounded-2xl text-sm font-bold text-rose-500 hover:bg-rose-500/10 transition-all"
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
