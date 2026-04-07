import { motion } from 'framer-motion';
import { Check, MonitorCog, Moon, SunMedium } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const OPTIONS = [
  {
    id: 'dark',
    title: 'Dark',
    subtitle: 'Focused contrast with softer glare for long review sessions.',
    icon: Moon,
  },
  {
    id: 'light',
    title: 'Light',
    subtitle: 'Bright paper-like surfaces with calmer shadows and lighter glass.',
    icon: SunMedium,
  },
];

const Settings = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="page-shell space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="glass-card p-6 sm:p-8"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="eyebrow">Preferences</p>
            <h1 className="text-3xl font-black tracking-tight text-foreground">Settings</h1>
            <p className="max-w-2xl text-sm text-[color:var(--theme-text-muted)]">
              Fine-tune the visual environment for memorization, correction drills, and nightly review.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--theme-border-strong)] bg-[color:var(--theme-surface-elevated)] px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-[color:var(--theme-text-muted)]">
            <MonitorCog className="h-4 w-4 text-emerald-500" />
            Saved to this device
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.34, delay: 0.05 }}
        className="glass-card p-6 sm:p-8"
      >
        <div className="mb-6 space-y-2">
          <p className="eyebrow">Appearance</p>
          <h2 className="text-xl font-black text-foreground">Theme Engine</h2>
          <p className="max-w-xl text-sm text-[color:var(--theme-text-muted)]">
            Switch instantly between dark and light palettes. The whole dashboard, charts, cards, and navigation update together.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {OPTIONS.map((option) => {
            const Icon = option.icon;
            const isActive = theme === option.id;

            return (
              <motion.button
                key={option.id}
                type="button"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setTheme(option.id)}
                className={`theme-option-card ${isActive ? 'theme-option-card--active' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 text-start">
                    <div className="theme-option-icon">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-foreground">{option.title}</h3>
                      <p className="text-sm text-[color:var(--theme-text-muted)]">{option.subtitle}</p>
                    </div>
                  </div>
                  <div className={`theme-option-check ${isActive ? 'theme-option-check--active' : ''}`}>
                    <Check className="h-4 w-4" />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.section>
    </div>
  );
};

export default Settings;
