import React, { useContext } from 'react';
import { Moon, Sun, LogOut, Globe, UserCircle2, BookMarked, Brain, GitMerge } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();

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
          
          {/* Logo — Official ThabatLogo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <img
                src="/ThabatLogo.png"
                alt="Thabat"
                className="h-9 w-9 object-contain group-hover:opacity-90 transition-opacity"
              />
              <span className="font-extrabold text-xl tracking-tight text-foreground group-hover:text-primary transition-colors">
                {t('navbar.app_name')}
              </span>
            </Link>
          </div>

          {/* Center Nav Links (desktop only) */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/errors"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                location.pathname === '/errors'
                  ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  : 'text-secondary-foreground hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              <BookMarked className="h-4 w-4" />
              كراسة الأخطاء
            </Link>
            <Link
              to="/review"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                location.pathname === '/review'
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'text-secondary-foreground hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              <Brain className="h-4 w-4" />
              Review
            </Link>

            {/* Divider */}
            <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

            <Link
              to="/mutashabihat"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                location.pathname === '/mutashabihat'
                  ? 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400'
                  : 'text-secondary-foreground hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              <GitMerge className="h-4 w-4" />
              المتشابهات
            </Link>
            <Link
              to="/mutashabihat-review"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                location.pathname === '/mutashabihat-review'
                  ? 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400'
                  : 'text-secondary-foreground hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              <Brain className="h-4 w-4" />
              مراجعة
            </Link>
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
              className="group flex items-center gap-1.5 text-sm font-medium text-secondary-foreground hover:text-destructive dark:hover:text-red-400 transition-colors px-3 py-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/10"
            >
              <LogOut className="h-4 w-4 rtl:rotate-180 transition-transform" />
              <span className="hidden sm:inline">{t('navbar.logout')}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
