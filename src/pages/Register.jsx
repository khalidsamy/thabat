import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Mail, Lock } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import Input from '../components/Input';
import Button from '../components/Button';

// Islamic geometric pattern
const IslamicPattern = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="islamic-grid-reg" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
        <path d="M40 0 L80 40 L40 80 L0 40 Z" fill="none" stroke="white" strokeWidth="1"/>
        <path d="M40 10 L70 40 L40 70 L10 40 Z" fill="none" stroke="white" strokeWidth="0.5"/>
        <circle cx="40" cy="40" r="8" fill="none" stroke="white" strokeWidth="0.5"/>
        <path d="M0 0 L20 20 M60 20 L80 0 M0 80 L20 60 M60 60 L80 80" stroke="white" strokeWidth="0.5"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#islamic-grid-reg)"/>
  </svg>
);

const QURAN_VERSE = {
  arabic: 'وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ',
  reference: 'سورة القمر — ٥٤:١٧',
  english: '"And We have certainly made the Quran easy for remembrance, so is there any who will remember?"',
};

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', formData);
      if (response.data.success) {
        showSuccess(t('auth.registration_success'));
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden bg-background">

      <IslamicPattern />

      {/* Visual background accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">

        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_50px_rgba(16,185,129,0.3)] mb-6 animate-bounce-slow">
            <span className="text-white font-black text-4xl">ث</span>
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase mb-2">Thabat</h1>
          <div className="h-1 w-12 bg-emerald-500 rounded-full"></div>
        </div>

        <div className="text-center mb-8 p-6 bg-emerald-900/10 rounded-3xl border border-white/5">
          <p className="text-xl font-black text-white leading-loose" dir="rtl">
            {QURAN_VERSE.arabic}
          </p>
          <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mt-2" dir="rtl">
            {QURAN_VERSE.reference}
          </p>
        </div>

        <div className="bg-card/80 border border-white/5 rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] px-10 py-12 transition-all duration-500 hover:shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
          <style>{`
            .elite-input input {
              height: 64px !important;
              border-radius: 20px !important;
              background: #0f172a !important; /* Slate-900 */
              border: 2px solid transparent !important;
              font-weight: 700 !important;
              font-size: 1rem !important;
              color: #f8fafc !important;
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

          <div className="text-center mb-10">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">
              {t('auth.register_title')}
            </h2>
            <p className="mt-2 text-xs font-bold text-slate-500 uppercase tracking-widest">{t('auth.register_subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="elite-input">
              <Input label={t('auth.full_name')} id="name" name="name" type="text"
                required autoComplete="name" placeholder={t('auth.name_placeholder')}
                value={formData.name} onChange={handleChange} icon={<User className="h-5 w-5" />}
              />
            </div>
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
              <Button type="submit" isLoading={isLoading} disabled={isLoading} className="h-16 w-full bg-white text-zinc-950 font-black text-lg rounded-2xl shadow-xl shadow-black/20 active:scale-95 transition-all uppercase tracking-widest hover:bg-slate-100">
                {isLoading ? t('auth.saving') : t('auth.create_account')}
              </Button>
            </div>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">
              {t('auth.already_have_account')}{' '}
              <Link to="/login"
                className="font-black text-emerald-400 hover:text-emerald-300 transition-colors underline underline-offset-[6px] decoration-4 decoration-emerald-500/20">
                {t('auth.sign_in')}
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

export default Register;
