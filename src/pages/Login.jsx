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

// Rotating Hadith selection
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

// Islamic geometric pattern
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
        showSuccess(t('auth.welcome_back', { name: user?.name }));
        navigate('/dashboard');
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-background">

      <IslamicPattern />

      {/* Visual background accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">

        <div className="flex flex-col items-center mb-10">
          <div className="mb-6 animate-bounce-slow">
            <img src="/ThabatLogo.png" alt="Thabat Logo" className="h-24 w-auto object-contain drop-shadow-2xl" />
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase mb-2">
            Thabat
          </h1>
          <div className="h-1 w-12 bg-emerald-500 rounded-full"></div>
        </div>

        <div className="mb-8 p-6 bg-emerald-900/10 rounded-3xl border border-white/5">
          <HadithDisplay />
        </div>

        <div className="bg-card/80 border border-white/5 rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] px-10 py-12 transition-all duration-500 hover:shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
          
          <div className="text-center mb-10">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">
              {t('auth.login_title')}
            </h2>
            <p className="mt-2 text-xs font-bold text-slate-500 uppercase tracking-widest">{t('auth.login_subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <style>{`
              .elite-input input {
                height: 64px !important;
                border-radius: 20px !important;
                background: #0f172a !important; /* Slate-900 */
                border: 2px solid transparent !important;
                font-weight: 700 !important;
                font-size: 1rem !important;
                color: #f8fafc !important; /* Slate-50 */
                transition: all 0.3s ease !important;
              }
              .elite-input input:focus {
                background: #1e293b !important; /* Slate-800 */
                border-color: #10b981 !important;
                box-shadow: 0 10px 30px rgba(16,185,129,0.1) !important;
              }
              .elite-input label {
                font-weight: 800 !important;
                font-size: 11px !important;
                text-transform: uppercase !important;
                letter-spacing: 0.1em !important;
                color: #64748b !important;
              }
            `}</style>

            <div className="elite-input">
              <Input label={t('auth.email')} id="email" name="email" type="email"
                required autoComplete="email" placeholder={t('auth.email_placeholder')}
                value={formData.email} onChange={handleChange} icon={<Mail className="h-5 w-5" />}
              />
            </div>
            <div className="elite-input">
              <Input label={t('auth.password')} id="password" name="password" type="password"
                required placeholder={t('auth.password_placeholder')}
                value={formData.password} onChange={handleChange} icon={<Lock className="h-5 w-5" />}
              />
            </div>

            <div className="pt-4">
              <Button type="submit" isLoading={isLoading} disabled={isLoading} className="h-16 w-full bg-white text-zinc-950 hover:bg-slate-100 font-black text-lg rounded-2xl shadow-xl shadow-black/20 active:scale-95 transition-all uppercase tracking-widest">
                {isLoading ? t('auth.saving') : t('auth.sign_in')}
              </Button>
            </div>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">
              {t('auth.dont_have_account')}{' '}
              <Link to="/register"
                className="font-black text-emerald-400 hover:text-emerald-300 transition-colors underline underline-offset-[6px] decoration-4 decoration-emerald-500/20">
                {t('auth.create_account')}
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-zinc-700 font-bold text-[10px] mt-10 tracking-[0.4em] uppercase">
          ثَبِّتْنَا عَلَى حِفْظِ كِتَابِكَ
        </p>
      </div>
    </div>
  );
};

export default Login;
