import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Lock } from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Input from '../components/Input';
import Button from '../components/Button';
import { useContext } from 'react';

// ── Rotating Hadith carousel ──────────────────────────────────────────────
const HADITHS = [
  {
    arabic: '«خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ»',
    reference: 'صحيح البخاري',
    english: '"The best of you are those who learn the Quran and teach it."',
  },
  {
    arabic: '«اقْرَأُوا الْقُرْآنَ فَإِنَّهُ يَأْتِي يَوْمَ الْقِيَامَةِ شَفِيعًا لِأَصْحَابِهِ»',
    reference: 'صحيح مسلم',
    english: '"Read the Quran, for it will come as an intercessor for its companions on the Day of Resurrection."',
  },
  {
    arabic: '«الَّذِي يَقْرَأُ الْقُرْآنَ وَهُوَ مَاهِرٌ بِهِ مَعَ السَّفَرَةِ الْكِرَامِ الْبَرَرَةِ»',
    reference: 'متفق عليه',
    english: '"One who is skilled in the Quran is with the noble righteous scribes."',
  },
];

const HadithDisplay = () => {
  const [current, setCurrent] = React.useState(0);
  React.useEffect(() => {
    const interval = setInterval(() => setCurrent((p) => (p + 1) % HADITHS.length), 5000);
    return () => clearInterval(interval);
  }, []);
  const h = HADITHS[current];
  return (
    <div className="text-center mb-6">
      <p className="text-lg font-bold text-emerald-100 leading-loose mb-1" dir="rtl">{h.arabic}</p>
      <p className="text-xs text-amber-300 font-semibold mb-1" dir="rtl">{h.reference}</p>
      <p className="text-xs text-white/60 italic">{h.english}</p>
      <div className="flex justify-center gap-1.5 mt-3">
        {HADITHS.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-5 bg-emerald-400' : 'w-1.5 bg-white/30'}`}
          />
        ))}
      </div>
    </div>
  );
};

// ── Islamic geometric SVG background ─────────────────────────────────────
const IslamicPattern = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="islamic-grid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
        <path d="M40 0 L80 40 L40 80 L0 40 Z" fill="none" stroke="white" strokeWidth="1"/>
        <path d="M40 10 L70 40 L40 70 L10 40 Z" fill="none" stroke="white" strokeWidth="0.5"/>
        <circle cx="40" cy="40" r="8" fill="none" stroke="white" strokeWidth="0.5"/>
        <path d="M0 0 L20 20 M60 20 L80 0 M0 80 L20 60 M60 60 L80 80" stroke="white" strokeWidth="0.5"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#islamic-grid)"/>
  </svg>
);

// ── Main Login Page ───────────────────────────────────────────────────────
const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', formData);
      if (response.data.success) {
        const { token, user } = response.data;
        login(token, user);
        showSuccess(t('auth.welcome_back', { name: user.name }));
        navigate('/dashboard');
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden
      bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900">

      {/* Islamic geometric pattern overlay */}
      <IslamicPattern />

      {/* Radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full
        bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/ThabatLogo.png"
            alt="Thabat Logo"
            className="h-20 w-20 object-contain drop-shadow-[0_0_20px_rgba(52,211,153,0.4)]"
          />
        </div>

        {/* Rotating Hadith */}
        <HadithDisplay />

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {t('auth.login_title')}
          </h1>
          <p className="mt-1 text-sm text-white/60">{t('auth.login_subtitle')}</p>
        </div>

        {/* Glassmorphism Card */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl shadow-black/40 px-7 py-8">
          <form onSubmit={handleSubmit} className="space-y-1">

            {/* Overriding input styles for glass card context */}
            <style>{`
              .glass-input input {
                background: rgba(255,255,255,0.08) !important;
                border-color: rgba(255,255,255,0.15) !important;
                color: white !important;
              }
              .glass-input input::placeholder { color: rgba(255,255,255,0.35) !important; }
              .glass-input input:focus { 
                border-color: rgba(52,211,153,0.6) !important;
                box-shadow: 0 0 0 4px rgba(52,211,153,0.12) !important;
              }
              .glass-input label { color: rgba(255,255,255,0.75) !important; }
              .glass-input .text-gray-400 { color: rgba(255,255,255,0.35) !important; }
              .glass-input .text-emerald-600 { color: #34d399 !important; }
            `}</style>

            <div className="glass-input">
              <Input label={t('auth.email')} id="email" name="email" type="email"
                required autoComplete="email" placeholder={t('auth.email_placeholder')}
                value={formData.email} onChange={handleChange} icon={<Mail className="h-4 w-4" />}
              />
            </div>
            <div className="glass-input">
              <Input label={t('auth.password')} id="password" name="password" type="password"
                required placeholder={t('auth.password_placeholder')}
                value={formData.password} onChange={handleChange} icon={<Lock className="h-4 w-4" />}
              />
            </div>

            <div className="pt-2">
              <Button type="submit" isLoading={isLoading} disabled={isLoading}>
                {isLoading ? t('auth.saving') : t('auth.sign_in')}
              </Button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-5 text-center">
            <p className="text-sm text-white font-medium">
              {t('auth.dont_have_account')}{' '}
              <Link to="/register"
                className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors underline underline-offset-4 decoration-2">
                {t('auth.create_account')}
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom ornament */}
        <p className="text-center text-white/25 text-xs mt-6 tracking-widest uppercase">
          ثَبِّتْنَا عَلَى حِفْظِ كِتَابِكَ
        </p>
      </div>
    </div>
  );
};

export default Login;
