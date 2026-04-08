import React from 'react';
import { motion } from 'framer-motion';
import { 
  Twitter, 
  Instagram, 
  Youtube, 
  Send, 
  ChevronRight, 
  Heart, 
  Sparkles,
  Github,
  Mail
} from 'lucide-react';

/**
 * Premium Thabat Footer Component.
 * features: RTL support, Framer Motion animations, 4-column responsive grid,
 * and a spiritually elegant dark theme aesthetic.
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    quickLinks: [
      { name: 'الرئيسية', href: '/dashboard' },
      { name: 'المساعد الذكي', href: '/dashboard/ai-coach' },
      { name: 'التلاوة', href: '/dashboard/recite' },
      { name: 'إحصائياتي', href: '/dashboard/stats' }
    ],
    resources: [
      { name: 'الأسئلة الشائعة', href: '/faq' },
      { name: 'تواصل معنا', href: '/contact' },
      { name: 'سياسة الخصوصية', href: '/privacy' },
      { name: 'شروط الاستخدام', href: '/terms' }
    ]
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <footer className="relative w-full bg-slate-950 border-t border-white/5 pt-20 pb-10 overflow-hidden" dir="rtl">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-teal-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          {/* Column 1: Brand & Mission */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Sparkles className="text-zinc-950 h-6 w-6" />
              </div>
              <span className="text-3xl font-black text-white tracking-tight">ثبات</span>
            </div>
            
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs font-medium">
              رفيقك الذكي في رحلة إتقان وتثبيت القرآن الكريم بطرق علمية ومنهجية.
            </p>

            <div className="flex items-center gap-4">
              {[
                { Icon: Twitter, href: '#' },
                { Icon: Instagram, href: '#' },
                { Icon: Youtube, href: '#' },
                { Icon: Github, href: '#' }
              ].map((social, idx) => (
                <motion.a
                  key={idx}
                  href={social.href}
                  whileHover={{ y: -3, scale: 1.1 }}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                >
                  <social.Icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Column 2: Quick Links */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h3 className="text-white font-black text-lg">روابط سريعة</h3>
            <ul className="space-y-4">
              {footerLinks.quickLinks.map((link, idx) => (
                <li key={idx}>
                  <motion.a 
                    href={link.href}
                    whileHover={{ x: -10 }}
                    className="text-slate-400 hover:text-emerald-400 flex items-center gap-2 group transition-colors text-sm font-bold"
                  >
                    <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity -scale-x-100" />
                    {link.name}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 3: Resources */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h3 className="text-white font-black text-lg">مصادر الدعم</h3>
            <ul className="space-y-4">
              {footerLinks.resources.map((link, idx) => (
                <li key={idx}>
                  <motion.a 
                    href={link.href}
                    whileHover={{ x: -10 }}
                    className="text-slate-400 hover:text-emerald-400 flex items-center gap-2 group transition-colors text-sm font-bold"
                  >
                    <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity -scale-x-100" />
                    {link.name}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 4: Newsletter / CTA */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h3 className="text-white font-black text-lg">انضم إلينا</h3>
            <p className="text-slate-400 text-sm font-medium">احصل على نصائح قرآنية وجداول حفظ دورية.</p>
            
            <form className="relative group" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="بريدك الإلكتروني" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 flex-row-reverse px-12 text-sm text-white placeholder:text-slate-600 focus:border-emerald-500 outline-none transition-all"
              />
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
              <button className="absolute left-2 top-2 bottom-2 px-4 bg-emerald-500 text-zinc-950 rounded-xl flex items-center justify-center hover:bg-emerald-400 transition-colors active:scale-95 shadow-lg shadow-emerald-500/20">
                <Send className="h-4 w-4 -scale-x-100" />
              </button>
            </form>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-sm shadow-xl shadow-emerald-500/10 flex items-center justify-center gap-3"
            >
              <Sparkles className="h-4 w-4" />
              حمل التطبيق الآن
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div 
          className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-slate-500 text-xs font-bold tracking-wide">
            © {currentYear} تطبيق ثبات. جميع الحقوق محفوظة.
          </p>

          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
            <span>صُنع بحب لخدمة أهل القرآن</span>
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500 animate-pulse" />
          </div>

          <div className="flex items-center gap-6">
            <a href="#" className="text-slate-600 hover:text-slate-400 transition-colors">
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
