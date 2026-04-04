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

  // ── Personal Info State ──────────────────────────────────────
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [reviewPace, setReviewPace] = useState(user?.reviewPace || 10);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // ── Password State ───────────────────────────────────────────
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
        // Update the global AuthContext so the Navbar reflects the new name instantly
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            Account Settings
          </h1>
          <p className="text-sm text-secondary-foreground mt-1">
            Manage your personal information and security settings.
          </p>
        </div>

        {/* ── CARD 1: Personal Information ─────────────────────── */}
        <div className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-slate-700 shadow-lg shadow-black/5 dark:shadow-black/30 mb-6 overflow-hidden">
          
          {/* Card Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-emerald-50/50 dark:bg-emerald-900/10">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
              <User className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Personal Information</h2>
              <p className="text-xs text-secondary-foreground">Update your display name</p>
            </div>
          </div>

          {/* Card Body */}
          <form onSubmit={handleProfileSave} className="px-6 py-6 space-y-1">
            <Input
              label="Full Name"
              id="name"
              name="name"
              type="text"
              required
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<User className="h-4 w-4" />}
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

        {/* ── CARD 2: Review Plan (Sheikh Alaa Methodology) ────── */}
        <div className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-slate-700 shadow-lg shadow-black/5 dark:shadow-black/30 mb-6 overflow-hidden">
          
          {/* Card Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-blue-50/50 dark:bg-blue-900/10">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
              <CalendarCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Review Plan (خطة المراجعة)</h2>
              <p className="text-xs text-secondary-foreground">Based on Sheikh Alaa Hamed's methodology</p>
            </div>
          </div>

          {/* Card Body */}
          <div className="px-6 py-6 transition-all duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                { val: 7, label: 'Ideal (المثالي)', sub: 'Complete in 7 Days', color: 'emerald' },
                { val: 10, label: 'Medium (المتوسط)', sub: 'Complete in 10 Days', color: 'blue' },
                { val: 14, label: 'Minimum (الحد الأدنى)', sub: 'Complete in 14 Days', color: 'amber' }
              ].map((plan) => (
                <button
                  key={plan.val}
                  type="button"
                  onClick={() => setReviewPace(plan.val)}
                  className={`relative p-4 rounded-xl border-2 text-start transition-all duration-300 group ${
                    reviewPace === plan.val 
                      ? 'border-primary bg-primary/5 shadow-md' 
                      : 'border-gray-100 dark:border-slate-700 hover:border-gray-200 dark:hover:border-slate-600'
                  }`}
                >
                  {reviewPace === plan.val && (
                    <div className="absolute top-2 end-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <h4 className={`text-sm font-bold ${reviewPace === plan.val ? 'text-primary' : 'text-foreground'}`}>
                    {plan.label}
                  </h4>
                  <p className="text-xs text-secondary-foreground mt-1">{plan.sub}</p>
                </button>
              ))}
            </div>

            <div className="pt-1">
              <Button onClick={handleProfileSave} isLoading={isSavingProfile} disabled={isSavingProfile} className="sm:w-auto px-8">
                <Save className="h-4 w-4 me-2" />
                {isSavingProfile ? 'Saving Plan...' : 'Update Review Plan'}
              </Button>
            </div>
          </div>
        </div>

        {/* ── CARD 2: Security / Change Password ───────────────── */}
        <div className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-slate-700 shadow-lg shadow-black/5 dark:shadow-black/30 overflow-hidden">

          {/* Card Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-amber-50/50 dark:bg-amber-900/10">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
              <KeyRound className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Security</h2>
              <p className="text-xs text-secondary-foreground">Change your account password</p>
            </div>
          </div>

          {/* Card Body */}
          <form onSubmit={handlePasswordChange} className="px-6 py-6 space-y-1">
            <Input
              label="Current Password"
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
              placeholder="Enter your current password"
              value={passwords.currentPassword}
              onChange={handlePasswordInput}
              icon={<Lock className="h-4 w-4" />}
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
              icon={<Lock className="h-4 w-4" />}
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
              icon={<CheckCircle className="h-4 w-4" />}
            />

            <div className="pt-1">
              <Button type="submit" isLoading={isChangingPassword} disabled={isChangingPassword} className="sm:w-auto px-8">
                <KeyRound className="h-4 w-4 me-2" />
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
