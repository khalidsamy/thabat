import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Lock, Mail, Save, KeyRound, CheckCircle, CalendarCheck } from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Input from '../components/Input';
import Button from '../components/Button';

const Profile = () => {
  const { t } = useTranslation();
  const { user, login } = useContext(AuthContext);
  const { showSuccess, showError } = useToast();

  // State management for personal and plan info
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [reviewPace, setReviewPace] = useState(user?.reviewPace || 10);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password update state
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Sync latest user data from backend on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/user/profile');
        if (res.data.success) {
          setName(res.data.user.name);
          setEmail(res.data.user.email);
          setReviewPace(res.data.user.reviewPace || 10);
        }
      } catch (err) {
        showError(err.message);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showError('Name cannot be empty.');
      return;
    }
    setIsSavingProfile(true);
    try {
      const res = await api.put('/user/profile', { 
        name: name.trim(),
        reviewPace
      });
      if (res.data.success) {
        // Synchronize global auth state
        const currentToken = localStorage.getItem('thabat_token');
        login(currentToken, res.data.user);
        showSuccess('Profile updated successfully!');
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

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
          <h1 className="text-3xl font-black text-zinc-950 dark:text-foreground tracking-tight mb-2">
            Account Settings
          </h1>
          <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
            Manage your personal information and security settings.
          </p>
        </div>

        {/* Personal Information */}
        <div className="bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/40 mb-10 overflow-hidden transition-all duration-300">
          
          {/* Card Header */}
          <div className="flex items-center gap-3 px-8 py-6 border-b border-slate-100 dark:border-slate-700 bg-emerald-50/30 dark:bg-emerald-900/10">
            <div className="p-3 bg-emerald-500/10 dark:bg-emerald-900/40 rounded-2xl">
              <User className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-zinc-950 dark:text-foreground uppercase tracking-tight">Personal Information</h2>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Update your display name</p>
            </div>
          </div>

          {/* Card Body */}
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

            {/* Email is read-only — shown for reference */}
            <div className="mb-5">
              <label className="block text-sm font-semibold tracking-wide text-secondary-foreground mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-gray-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="appearance-none block w-full py-3.5 ps-11 pe-4 border rounded-xl shadow-sm bg-gray-50 dark:bg-slate-700/50 text-secondary-foreground text-sm border-gray-200 dark:border-slate-600 cursor-not-allowed opacity-70"
                />
              </div>
              <p className="mt-1.5 text-xs text-secondary-foreground opacity-70">
                Email cannot be changed for security reasons.
              </p>
            </div>

            <div className="pt-1">
              <Button type="submit" isLoading={isSavingProfile} disabled={isSavingProfile} className="sm:w-auto px-8">
                <Save className="h-4 w-4 me-2" />
                {isSavingProfile ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>

        {/* Review Plan Selection */}
        <div className="bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/40 mb-10 overflow-hidden transition-all duration-300">
          
          {/* Card Header */}
          <div className="flex items-center gap-3 px-8 py-6 border-b border-slate-100 dark:border-slate-700 bg-emerald-50/30 dark:bg-emerald-900/10">
            <div className="p-3 bg-emerald-500/10 dark:bg-emerald-900/40 rounded-2xl">
              <CalendarCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-zinc-950 dark:text-foreground uppercase tracking-tight">Review Plan</h2>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Select your daily target preference</p>
            </div>
          </div>

          {/* Card Body */}
          <div className="px-8 py-10 transition-all duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              {[
                { val: 7, label: 'Ideal (المثالي)', sub: 'Complete in 7 Days', color: 'emerald' },
                { val: 10, label: 'Medium (المتوسط)', sub: 'Complete in 10 Days', color: 'blue' },
                { val: 14, label: 'Minimum (الحد الأدنى)', sub: 'Complete in 14 Days', color: 'amber' }
              ].map((plan) => (
                <button
                  key={plan.val}
                  type="button"
                  onClick={() => setReviewPace(plan.val)}
                  className={`relative p-6 rounded-2xl border-4 text-start transition-all duration-300 group ${
                    reviewPace === plan.val 
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-lg' 
                      : 'border-slate-50 dark:border-slate-900 bg-slate-50 dark:bg-slate-900/50 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  {reviewPace === plan.val && (
                    <div className="absolute top-3 end-3">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    </div>
                  )}
                  <h4 className={`text-base font-black ${reviewPace === plan.val ? 'text-emerald-700 dark:text-emerald-400' : 'text-zinc-950 dark:text-foreground'}`}>
                    {plan.label}
                  </h4>
                  <p className="text-[10px] font-bold text-zinc-500 mt-2 uppercase tracking-widest">{plan.sub}</p>
                </button>
              ))}
            </div>

            <div className="pt-2">
              <Button onClick={handleProfileSave} isLoading={isSavingProfile} disabled={isSavingProfile} className="h-16 px-10 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 text-white rounded-3xl font-black shadow-xl shadow-zinc-950/20 transition-all active:scale-95">
                <Save className="h-5 w-5 me-3" />
                {isSavingProfile ? 'Saving Plan...' : 'Update Review Plan'}
              </Button>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/40 overflow-hidden transition-all duration-300">

          {/* Card Header */}
          <div className="flex items-center gap-3 px-8 py-6 border-b border-slate-100 dark:border-slate-700 bg-amber-50/30 dark:bg-amber-900/10">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-2xl">
              <KeyRound className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-zinc-950 dark:text-foreground uppercase tracking-tight">Security</h2>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Change your account password</p>
            </div>
          </div>

          {/* Card Body */}
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
              <Button type="submit" isLoading={isChangingPassword} disabled={isChangingPassword} className="h-16 px-10 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 text-white rounded-3xl font-black shadow-xl shadow-zinc-950/20 transition-all active:scale-95">
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
