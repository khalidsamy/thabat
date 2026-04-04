import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { Home, TrendingUp, Mic, MessageCircle, BookOpen, Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const FloatingAssistantMenu = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'الرئيسية', exact: true },
    { path: '/dashboard/progress', icon: TrendingUp, label: 'التقدم' },
    { path: '/dashboard/recite', icon: Mic, label: 'تسميع' },
    { path: '/dashboard/community', icon: MessageCircle, label: 'المجتمع' },
    { path: '/dashboard/review-session', icon: BookOpen, label: 'المراجعة' },
  ];

  const menuVariants = {
    closed: { scale: 0, opacity: 0, y: 50 },
    open: { 
      scale: 1, 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    closed: { scale: 0, opacity: 0, y: 10 },
    open: { scale: 1, opacity: 1, y: 0 }
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[70] flex flex-col items-center gap-6 md:hidden">
      
      {/* Expanded Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="flex flex-col gap-4 glass-assistive p-4 rounded-[2.5rem]"
          >
            {navItems.map((item) => (
              <motion.div key={item.path} variants={itemVariants}>
                <NavLink
                  to={item.path}
                  end={item.exact}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => `flex items-center gap-4 px-6 py-4 rounded-[2rem] transition-all duration-300 min-w-[180px] ${
                    isActive 
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 font-black' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className="h-6 w-6" />
                  <span className="text-sm font-bold tracking-tight">{item.label}</span>
                </NavLink>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB Trigger */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 border-2 border-white/20 relative group overflow-hidden ${
          isOpen ? 'bg-rose-500 shadow-rose-500/40 rotate-180' : 'bg-emerald-500 shadow-emerald-500/40'
        }`}
      >
        {/* Core Glow Pulse */}
        <motion.div
          animate={{ 
            scale: [1, 1.4, 1], 
            opacity: [0.3, 0.1, 0.3] 
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute inset-0 rounded-full blur-2xl -z-10 ${
            isOpen ? 'bg-rose-400' : 'bg-emerald-400'
          }`}
        />
        
        {isOpen ? (
          <X className="h-10 w-10 text-white" />
        ) : (
          <Plus className="h-10 w-10 text-white" />
        )}
      </motion.button>
    </div>
  );
};

export default FloatingAssistantMenu;
