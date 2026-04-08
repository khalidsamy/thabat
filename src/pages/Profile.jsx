import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, Lock, Mail, Save, KeyRound, CheckCircle, CalendarCheck, Download, Sparkles as SparklesIcon, Trophy as TrophyIcon, FileText } from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Input from '../components/Input';
import Button from '../components/Button';
import { BADGES, getUnlockedBadges, getBadgeProgress } from '../utils/AchievementEngine';
import { useTranslation } from 'react-i18next';
import { generateProgressReport } from '../utils/ReportGenerator';

const Profile = () => {
  const { user: authUser, updateUser } = useContext(AuthContext);
  const context = useOutletContext() || {};
  const { progress, user: contextUser } = context;
  const user = contextUser || authUser;
  
  const { showSuccess, showError } = useToast();
  const { t, i18n } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportJourney = async () => {
    setIsExporting(true);
    try {
      await generateProgressReport(user, progress, t, i18n.language === 'ar');
      showSuccess(i18n.language === 'ar' ? 'تم تصدير رحلتك بنجاح!' : 'Journey exported successfully!');
    } catch (e) {
       showError('Export failed');
    } finally {
       setIsExporting(false);
    }
  };

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [revisionIntensity, setRevisionIntensity] = useState(user?.revisionIntensity || 'HIZB');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get('/user/profile');
      if (res.data.success) {
        setName(res.data.user.name);
        setEmail(res.data.user.email);
        setRevisionIntensity(res.data.user.revisionIntensity || 'HIZB');
      }
    } catch (err) {
      showError(err.message);
    }
  }, [showError]);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  const handleProfileSave = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      showError('Name cannot be empty.');
      return;
    }
    setIsSavingProfile(true);
    try {
      // Endpoint is now PATCH as per latest backend updates
      const res = await api.patch('/user/profile', { 
        name: name.trim(),
        revisionIntensity
      });
      if (res.data.success) {
        updateUser(res.data.user);
        showSuccess('Profile and Mission plan updated!');
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setIsSavingProfile(false);
    }
  }, [name, revisionIntensity, showError, showSuccess, updateUser]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwords;

    if (!currentPassword || !newPassword || !confirmPassword) {
      showError('Please fill in all password fields.');
      return;
    }
    if (newPassword.length < 6) {
      showError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showError('New passwords do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await api.put('/user/password', { currentPassword, newPassword });
      if (res.data.success) {
        showSuccess('Password changed successfully!');
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handlePasswordInput = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-2xl mx-auto">

        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-black text-foreground tracking-tight mb-2">
            Account Settings
          </h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
            Manage your personal data and Hifz commitment.
          </p>
        </div>

        {/* Basic Info */}
        <div className="bg-slate-800/80 rounded-3xl border border-white/5 shadow-xl shadow-black/40 mb-10 overflow-hidden transition-all duration-300">
          <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 rounded-2xl">
                <SparklesIcon className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-black text-foreground uppercase tracking-tight">Personal Information</h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Manage your identity and export progress</p>
              </div>
            </div>
            <button
               onClick={handleExportJourney}
               disabled={isExporting}
               className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 hover:bg-emerald-500 hover:text-zinc-950 transition-all text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
            >
               {isExporting ? <div className="h-3 w-3 border-2 border-emerald-400 border-t-transparent animate-spin rounded-full" /> : <Download className="h-3.5 w-3.5" />}
               {isExporting ? 'Exporting...' : 'Export Journey'}
            </button>
          </div>

          <form onSubmit={handleProfileSave} className="px-8 py-10 space-y-6">
            <Input
              label="Full Name"
              id="name"
              name="name"
              type="text"
              required
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<User className="h-5 w-5" />}
              className="h-14 font-bold"
            />

            <div className="mb-5">
              <label className="block text-sm font-semibold tracking-wide text-foreground mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="appearance-none block w-full py-3.5 ps-11 pe-4 border rounded-xl shadow-sm bg-slate-700/50 text-foreground text-sm border-white/5 cursor-not-allowed opacity-70"
                />
              </div>
              <p className="mt-1.5 text-xs text-slate-500 opacity-70">
                Email cannot be changed for security reasons.
              </p>
            </div>

            <div className="pt-1">
              <Button type="submit" isLoading={isSavingProfile} disabled={isSavingProfile} className="sm:w-auto px-8 bg-white text-zinc-950 font-black hover:bg-slate-100">
                <Save className="h-4 w-4 me-2" />
                {isSavingProfile ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>

        {/* Revision Plan Selection - Sheikh Alaa methodology */}
        <div className="bg-slate-800/80 rounded-3xl border border-white/5 shadow-xl shadow-black/40 mb-10 overflow-hidden transition-all duration-300">
          
          <div className="flex items-center gap-3 px-8 py-6 border-b border-white/5 bg-emerald-900/10">
            <div className="p-3 bg-emerald-900/40 rounded-2xl">
              <CalendarCheck className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground uppercase tracking-tight">Mission Goal (الورد اليومي)</h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Select your daily revision intensity</p>
            </div>
          </div>

          <div className="px-8 py-10 transition-all duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {[
                { val: 'HIZB', label: 'Balanced (حزب/يوم)', sub: '1/2 Juz Daily', color: 'emerald' },
                { val: '1_JUZ', label: 'Strong (جزء/يوم)', sub: '1 Juz Daily', color: 'blue' },
                { val: '2_JUZ', label: 'Intensive (جزئين/يوم)', sub: '2 Juz Daily', color: 'amber' },
                { val: 'RUB_EL_HIZB', label: 'Light (ربع/يوم)', sub: '1/4 Hizb Daily', color: 'slate' }
              ].map((plan) => (
                <button
                  key={plan.val}
                  type="button"
                  onClick={() => setRevisionIntensity(plan.val)}
                  className={`relative p-5 rounded-2xl border-2 text-start transition-all duration-300 group ${
                    revisionIntensity === plan.val 
                      ? 'border-emerald-500 bg-emerald-900/20 shadow-lg' 
                      : 'border-white/5 bg-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className={`text-sm font-black ${revisionIntensity === plan.val ? 'text-emerald-400' : 'text-foreground'}`}>
                        {plan.label}
                    </h4>
                    {revisionIntensity === plan.val && (
                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-widest">{plan.sub}</p>
                </button>
              ))}
            </div>

            <div className="pt-2">
              <Button onClick={handleProfileSave} isLoading={isSavingProfile} disabled={isSavingProfile} className="h-16 px-10 bg-white text-zinc-950 rounded-3xl font-black shadow-xl shadow-black/20 transition-all active:scale-95 hover:bg-slate-100">
                <Save className="h-5 w-5 me-3" />
                {isSavingProfile ? 'Saving Plan...' : 'Update Review Plan'}
              </Button>
            </div>
          </div>
        </div>

        {/* Hifz Mastery Achievements */}
        <div className="bg-slate-800/80 rounded-3xl border border-white/5 shadow-xl shadow-black/40 mb-10 overflow-hidden transition-all duration-300">
          <div className="flex items-center gap-3 px-8 py-6 border-b border-white/5 bg-amber-900/10">
            <div className="p-3 bg-amber-900/40 rounded-2xl">
              <TrophyIcon className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground uppercase tracking-tight">Hifz Achievements</h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Your spiritual milestones and honors</p>
            </div>
          </div>

          <div className="px-8 py-10">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {BADGES.map((badge) => {
                const isUnlocked = badge.requirement(user, progress);
                const perc = getBadgeProgress(badge.id, user, progress);
                const Icon = badge.icon;
                
                return (
                  <div key={badge.id} className="relative group flex flex-col items-center text-center">
                    {/* Badge Icon */}
                    <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center relative z-10 transition-all duration-700 ${
                      isUnlocked 
                        ? `bg-${badge.color}-500/20 border-2 border-${badge.color}-500 shadow-[0_0_20px_rgba(0,0,0,0.3)]` 
                        : 'bg-white/5 border border-white/10 grayscale opacity-40'
                    }`}>
                      <Icon className={`w-8 h-8 sm:w-10 sm:h-10 ${isUnlocked ? `text-${badge.color}-400` : 'text-slate-500'}`} />
                      
                      {/* Unlock Glow */}
                      {isUnlocked && (
                        <div className={`absolute inset-0 rounded-full blur-xl opacity-20 bg-${badge.color}-500 animate-pulse`} />
                      )}
                    </div>

                    {/* Progress Ring for Locked Badges */}
                    {!isUnlocked && (
                      <div className="absolute top-0 w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
                         <svg className="w-full h-full -rotate-90">
                            <circle
                               cx="50%" cy="50%" r="48%"
                               stroke="currentColor" strokeWidth="2" fill="transparent"
                               className="text-white/5"
                            />
                            <circle
                               cx="50%" cy="50%" r="48%"
                               stroke="currentColor" strokeWidth="2" fill="transparent"
                               strokeDasharray="300"
                               strokeDashoffset={300 - (3 * perc)}
                               className="text-emerald-500/20"
                            />
                         </svg>
                      </div>
                    )}

                    <div className="mt-4 space-y-1">
                      <h4 className={`text-xs sm:text-sm font-black uppercase tracking-tight ${isUnlocked ? 'text-white' : 'text-slate-600'}`}>
                        {t(badge.nameKey)}
                      </h4>
                      <p className="text-[9px] font-bold text-slate-500 leading-tight px-1 uppercase tracking-tighter">
                        {t(badge.descKey)}
                      </p>
                    </div>

                    {/* Locked Requirement Tooltip */}
                    {!isUnlocked && (
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-zinc-900 border border-white/10 p-2 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 w-32 border-b-2 border-b-emerald-500">
                        <p className="text-[9px] font-black text-emerald-500 uppercase mb-1">Requirement</p>
                        <p className="text-[10px] text-white font-medium">{badge.goal - badge.current(user, progress)} more to go</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="bg-slate-800/80 rounded-3xl border border-white/5 shadow-xl shadow-black/40 mb-10 overflow-hidden transition-all duration-300">
          
          <div className="flex items-center gap-3 px-8 py-6 border-b border-white/5 bg-sky-900/10">
            <div className="p-3 bg-sky-900/40 rounded-2xl">
              <Sparkles className="h-6 w-6 text-sky-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground uppercase tracking-tight">Exam Readiness</h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Random test performance history</p>
            </div>
          </div>

          <div className="px-8 py-10">
            <div className="grid grid-cols-2 gap-6 mb-8">
               <div className="p-6 bg-white/[0.03] rounded-2xl border border-white/5 text-center">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Tests</p>
                  <p className="text-3xl font-black text-white">{user?.examStats?.passed + user?.examStats?.failed || 0}</p>
               </div>
               <div className="p-6 bg-white/[0.03] rounded-2xl border border-white/5 text-center">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Success Rate</p>
                  <p className="text-3xl font-black text-emerald-400">
                    {user?.examStats?.passed ? Math.round((user.examStats.passed / (user.examStats.passed + user.examStats.failed)) * 100) : 0}%
                  </p>
               </div>
            </div>

            {user?.examHistory?.length > 0 ? (
              <div className="space-y-3">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Recent Attempts</p>
                {user.examHistory.slice(-3).reverse().map((exam, i) => (
                   <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/5">
                      <div className="flex items-center gap-3">
                         <div className={`w-2 h-2 rounded-full ${exam.status === 'PASSED' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                         <span className="text-xs font-bold text-white">{exam.surah}</span>
                         <span className="text-[9px] font-black text-slate-500 uppercase">Juz {exam.juz}</span>
                      </div>
                      <span className="text-[9px] font-black text-slate-600">
                        {new Date(exam.date).toLocaleDateString()}
                      </span>
                   </div>
                ))}
              </div>
            ) : (
                <div className="text-center py-4">
                   <p className="text-xs font-bold text-slate-500">No exams taken yet. Test your stability on the Progress page!</p>
                </div>
            )}
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-slate-800/80 rounded-3xl border border-white/5 shadow-xl shadow-black/40 overflow-hidden transition-all duration-300">

          <div className="flex items-center gap-3 px-8 py-6 border-b border-white/5 bg-amber-900/10">
            <div className="p-3 bg-amber-900/40 rounded-2xl">
              <KeyRound className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground uppercase tracking-tight">Security</h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Change your account password</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="px-8 py-10 space-y-6">
            <Input
              label="Current Password"
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
              placeholder="Enter your current password"
              value={passwords.currentPassword}
              onChange={handlePasswordInput}
              icon={<Lock className="h-5 w-5" />}
              className="h-14 font-bold"
            />
            <Input
              label="New Password"
              id="newPassword"
              name="newPassword"
              type="password"
              required
              placeholder="Min. 6 characters"
              value={passwords.newPassword}
              onChange={handlePasswordInput}
              icon={<Lock className="h-5 w-5" />}
              className="h-14 font-bold"
            />
            <Input
              label="Confirm New Password"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              placeholder="Repeat new password"
              value={passwords.confirmPassword}
              onChange={handlePasswordInput}
              icon={<CheckCircle className="h-5 w-5" />}
              className="h-14 font-bold"
            />

            <div className="pt-2">
              <Button type="submit" isLoading={isChangingPassword} disabled={isChangingPassword} className="h-16 px-10 bg-white text-zinc-950 rounded-3xl font-black shadow-xl shadow-black/20 transition-all active:scale-95 hover:bg-slate-100">
                <KeyRound className="h-5 w-5 me-3" />
                {isChangingPassword ? 'Changing...' : 'Change Password'}
              </Button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;
