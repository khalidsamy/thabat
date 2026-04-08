import React, { useState, useEffect, useContext, useCallback } from 'react';
import { User, Lock, Mail, Save, KeyRound, CheckCircle, CalendarCheck } from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Input from '../components/Input';
import Button from '../components/Button';

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const { showSuccess, showError } = useToast();

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

        {/* Personal Information */}
        <div className="bg-slate-800/80 rounded-3xl border border-white/5 shadow-xl shadow-black/40 mb-10 overflow-hidden transition-all duration-300">
          
          <div className="flex items-center gap-3 px-8 py-6 border-b border-white/5 bg-emerald-900/10">
            <div className="p-3 bg-emerald-900/40 rounded-2xl">
              <User className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground uppercase tracking-tight">Personal Information</h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Update your display name</p>
            </div>
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
