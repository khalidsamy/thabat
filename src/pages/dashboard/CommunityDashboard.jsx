import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { 
  Trophy, 
  Star, 
  Users, 
  MessageCircle, 
  Heart, 
  Zap, 
  Send, 
  Sparkles, 
  TrendingUp, 
  Award,
  ShieldCheck,
  Flame,
  Layout,
  Timer
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/Button';

const CommunityDashboard = (props) => {
  const { t, i18n } = useTranslation();
  const context = useOutletContext() || {};
  const { 
    progress, 
    user, 
    dailyVerse, 
    itemVariants, 
    onVisualize, 
    reciteLocked, 
    refreshData 
  } = { 
    progress: context?.progress || {}, 
    user: context?.user || {}, 
    ...context, 
    ...props 
  };
  const { showSuccess, showError } = useToast();
  const isArabic = i18n.language === 'ar';

  const [activeTab, setActiveTab] = useState('overview'); // ['overview', 'leaderboard', 'reflections']
  const [stats, setStats] = useState({ totalKhatmas: 0, recentActivities: [] });
  const [leaderboard, setLeaderboard] = useState([]);
  const [reflections, setReflections] = useState([]);
  const [newReflection, setNewReflection] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  // Constants for Global Goal
  const GLOBAL_KHATMA_GOAL = 1000;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsRes, leaderboardRes, reflectionsRes] = await Promise.all([
        api.get('/community/stats'),
        api.get('/leaderboard'),
        api.get('/community')
      ]);

      if (statsRes.data.success) setStats(statsRes.data);
      if (leaderboardRes.data.success) setLeaderboard(leaderboardRes.data.leaderboard);
      if (reflectionsRes.data.success) setReflections(reflectionsRes.data.data);
    } catch (err) {
      console.error('Failed to fetch community data:', err);
      showError(t('dashboard.fetch_error'));
    } finally {
      setIsLoading(false);
    }
  }, [showError, t]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handlePostReflection = async (e) => {
    e.preventDefault();
    if (!newReflection.trim() || newReflection.length > 200) return;

    setIsPosting(true);
    try {
      const response = await api.post('/community/reflect', { content: newReflection });
      if (response.data.success) {
        setNewReflection('');
        showSuccess(isArabic ? 'تم نشر تأملك بنجاح!' : 'Reflection shared with the Ummah!');
        await fetchData();
      }
    } catch (err) {
      showError(err.response?.data?.message || err.message);
    } finally {
      setIsPosting(false);
    }
  };

  const handleCheer = async (activityId) => {
    try {
      const res = await api.post(`/community/cheer/${activityId}`);
      if (res.data.success) {
        showSuccess(isArabic ? 'تقبل الله صالح الأعمال!' : 'Sent encouragement!');
        setStats(prev => ({
          ...prev,
          recentActivities: prev.recentActivities.map(a => 
            a._id === activityId ? { ...a, cheersCount: res.data.cheersCount, cheeredBy: [...a.cheeredBy, user?._id] } : a
          )
        }));
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Already cheered');
    }
  };

  const renderOverview = () => {
    const khatmaProgress = Math.min(100, (stats.totalKhatmas / GLOBAL_KHATMA_GOAL) * 100);

    return (
      <div className="space-y-8 animate-fade-in">
        {/* Global Goal Card */}
        <section className="glass-card rounded-[2.5rem] p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 blur-[100px] rounded-full -mr-40 -mt-40" />
          
          <div className="relative z-10 space-y-8 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-2 block">
                  {isArabic ? 'تحدي الأمة الرمضاني' : 'Ummah Ramadan Challenge'}
                </span>
                <h3 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                  {isArabic ? 'هدف الـ 1,000 ختمة' : 'The 1,000 Khatma Goal'}
                </h3>
              </div>
              <div className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto sm:mx-0 border border-emerald-500/20 shadow-xl shadow-emerald-500/5">
                <TrendingUp className="h-8 w-8 text-emerald-500" />
              </div>
            </div>

            <div className="space-y-4">
               <div className="flex items-center justify-between font-black text-xs uppercase tracking-widest text-slate-400">
                  <span>{stats.totalKhatmas} {isArabic ? 'ختمة' : 'Khatmas'}</span>
                  <span>{GLOBAL_KHATMA_GOAL} {isArabic ? 'الهدف' : 'Target'}</span>
               </div>
               <div className="h-5 w-full bg-white/5 rounded-full p-1 overflow-hidden border border-white/5 shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${khatmaProgress}%` }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                  />
               </div>
               <p className="text-center text-xs font-bold text-slate-500 italic">
                  {isArabic 
                    ? '"وتعاونوا على البر والتقوى..." - فلنصل للهدف معاً!' 
                    : '"Help one another in acts of piety and righteousness..." — Let’s reach it together!'}
               </p>
            </div>
          </div>
        </section>

        {/* Activity Feed / Encouragement Wall */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20">
                <Zap className="h-5 w-5 text-amber-500" />
             </div>
             <h3 className="text-xl font-black text-white tracking-tight">{isArabic ? 'لوحة المباركات' : 'Encouragement Wall'}</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
             {stats.recentActivities?.map((activity, idx) => (
               <motion.div 
                 key={activity._id || idx}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="glass-card hover:bg-white/[0.04] p-5 rounded-[2rem] border border-white/5 transition-all group"
               >
                 <div className="flex flex-col gap-4">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center font-black text-emerald-500 text-xs">
                         {activity.anonymizedName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                         <p className="text-xs font-black text-white truncate">{activity.anonymizedName}</p>
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{activity.milestoneValue}</p>
                      </div>
                   </div>
                   
                   <div className="surface-inset p-3 px-4 rounded-2xl flex items-center justify-between">
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none">
                         {isArabic ? 'أتم الجهد!' : 'Completed!'}
                      </span>
                      <button
                        onClick={() => handleCheer(activity._id)}
                        disabled={activity.cheeredBy?.includes(user?._id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${
                          activity.cheeredBy?.includes(user?._id)
                            ? 'bg-amber-500 text-white' 
                            : 'bg-white/5 text-slate-500 hover:text-white hover:bg-white/10'
                        }`}
                      >
                         <span className="text-[10px] font-black">{activity.cheersCount || 0}</span>
                         <Heart className={`h-3 w-3 ${activity.cheeredBy?.includes(user?._id) ? 'fill-white' : ''}`} />
                         {!activity.cheeredBy?.includes(user?._id) && <span className="text-[9px] font-black uppercase tracking-tighter ml-1">Mubarak!</span>}
                      </button>
                   </div>
                 </div>
               </motion.div>
             ))}
             {stats.recentActivities?.length === 0 && (
                <div className="col-span-full py-12 text-center opacity-30">
                   <Users className="h-10 w-10 mx-auto mb-3" />
                   <p className="text-xs font-bold uppercase tracking-widest">Waiting for the first winner...</p>
                </div>
             )}
          </div>
        </div>
      </div>
    );
  };

  const renderLeaderboard = () => (
    <div className="space-y-6 animate-fade-in">
       <div className="glass-card rounded-[2.5rem] p-8 sm:p-10">
          <div className="flex items-center gap-4 mb-10">
             <div className="w-16 h-16 bg-amber-500/10 rounded-3xl flex items-center justify-center border border-amber-500/20 shadow-xl shadow-amber-500/5">
                <Award className="h-8 w-8 text-amber-500" />
             </div>
             <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 mb-1 block">The Vanguard</span>
                <h3 className="text-3xl font-black text-white tracking-tight">{isArabic ? 'أبرز الصابتون' : 'Top Sabitoon'}</h3>
             </div>
          </div>

          <div className="space-y-4">
             {leaderboard.map((entry, idx) => (
               <div 
                 key={idx}
                 className={`flex items-center justify-between p-5 rounded-3xl border transition-all ${
                   idx === 0 ? 'bg-amber-500/10 border-amber-500/30 shadow-lg shadow-amber-500/5' : 'bg-white/5 border-white/5'
                 }`}
               >
                 <div className="flex items-center gap-5">
                    <span className={`w-8 text-center font-black text-lg ${idx < 3 ? 'text-amber-500' : 'text-slate-600'}`}>
                       #{idx + 1}
                    </span>
                    <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center text-xs font-black text-white">
                       {entry.name.charAt(0)}
                    </div>
                    <div>
                       <p className="text-base font-black text-white">{entry.name}</p>
                       <div className="flex gap-4 mt-1">
                          <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                             <Flame className="h-3 w-3" />
                             {entry.streak} {isArabic ? 'يوم' : 'Days'}
                          </span>
                          <span className="flex items-center gap-1.5 text-[9px] font-black text-sky-500 uppercase tracking-widest">
                             <Zap className="h-3 w-3" />
                             {entry.doneToday} {isArabic ? 'آيات' : 'Ayahs Today'}
                          </span>
                       </div>
                    </div>
                 </div>
                 <div className="hidden sm:block text-right">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Rank</p>
                    <p className="text-xs font-black text-white">{idx === 0 ? 'Gold' : idx === 1 ? 'Silver' : idx === 2 ? 'Bronze' : 'Warrior'}</p>
                 </div>
               </div>
             ))}
             {leaderboard.length === 0 && (
                <div className="text-center py-12 opacity-30">
                   <p className="text-sm font-bold">Synchronizing the Vanguard...</p>
                </div>
             )}
          </div>
       </div>
    </div>
  );

  const renderReflections = () => {
    const canPost = progress?.doneToday >= progress?.dailyTarget;

    return (
      <div className="space-y-12 animate-fade-in max-w-2xl mx-auto">
        <div className={`glass-card rounded-[2.5rem] p-6 sm:p-10 shadow-xl transition-all duration-500 ${
          canPost ? 'bg-white/5 border-white/5' : 'bg-amber-500/5 opacity-90'
        }`}>
          {!canPost ? (
            <div className="text-center space-y-6 py-4">
               <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Sparkles className="h-10 w-10 text-amber-500" />
               </div>
               <p className="text-amber-200 font-black text-lg uppercase tracking-tight">
                 {isArabic ? 'أكمل وردك أولاً لتشارك!' : 'Daily Goal Required'}
               </p>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-relaxed">
                  {isArabic 
                    ? 'أتمم وردك اليومي لتتمكن من مشاركة تأملاتك الروحانية مع المجتمع.'
                    : 'Complete your daily Hifz target to unlock spiritual sharing.'}
               </p>
            </div>
          ) : (
            <form onSubmit={handlePostReflection} className="space-y-6">
              <textarea
                value={newReflection}
                onChange={(e) => setNewReflection(e.target.value)}
                placeholder={isArabic ? 'بماذا يتحدث قلبك اليوم؟' : 'What is your heart reflecting on today?'}
                maxLength={200}
                className="w-full h-40 bg-slate-900 shadow-inner rounded-[2rem] p-6 text-foreground border-none focus:ring-4 focus:ring-emerald-500/10 transition-all resize-none font-bold text-xl leading-relaxed text-center"
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {newReflection.length} / 200
                </span>
                <Button 
                  type="submit" 
                  disabled={isPosting || !newReflection.trim()} 
                  isLoading={isPosting}
                  className="h-14 px-10 rounded-2xl bg-white text-zinc-950 font-black uppercase tracking-widest shadow-xl shadow-black/20 active:scale-95 transition-all hover:bg-slate-100"
                >
                  <Send className="h-4 w-4 me-3" />
                  {isArabic ? 'شارك' : 'Share'}
                </Button>
              </div>
            </form>
          )}
        </div>

        <div className="space-y-4">
            {reflections.map((reflection, index) => (
              <motion.div
                key={reflection._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="group glass-card hover:bg-emerald-500/5 p-6 rounded-3xl border border-white/5 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                       <div className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center text-[10px] font-black text-emerald-400 border border-emerald-500/20">
                          {reflection.userName.charAt(0).toUpperCase()}
                       </div>
                       <span className="text-sm font-black text-white">{reflection.userName}</span>
                        <span className="text-[10px] text-slate-500">• {new Date(reflection.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed font-bold italic">
                      "{reflection.content}"
                    </p>
                  </div>
                  <button className="shrink-0 flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/5 text-slate-500 hover:text-rose-400 transition-colors">
                    <Heart className="h-5 w-5" />
                    <span className="text-[10px] font-black">{reflection.duaCount}</span>
                  </button>
                </div>
              </motion.div>
            ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-52 md:pb-44 space-y-10">
      {/* Header Section */}
      <section className="glass-card overflow-hidden rounded-[2rem] p-5 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-amber-500">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid rgba(16, 185, 129, 0.2)', paddingBottom: '30px', marginBottom: '40px'}}>
                <div style={{flex: 1}}>
                  <h1 style={{fontSize: '36px', fontWeight: 900, margin: 0, color: '#fff', letterSpacing: '-1px', textAlign: isArabic ? 'right' : 'left'}}>
                    {isArabic ? 'تقارير الثبات' : 'THABAT REPORT'}
                  </h1>
                </div>
              </div>
              <Users className="h-4 w-4" />
              {isArabic ? 'المجتـــمع' : 'The Thabat Ummah'}
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl text-white">
              {isArabic ? 'ساحة الصابتون' : 'The Believers Hub'}
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              {isArabic 
                ? 'تنافسوا في الخيرات، وشاركونا تأملاتكم، وشجعوا إخوتكم في رحلة القرآن.'
                : 'Compete in good deeds, share your reflections, and encourage your sisters & brothers in their Quranic journey.'}
            </p>
          </div>
        </div>
      </section>

      {/* Primary Tabs */}
      <div className="flex items-center justify-center gap-2 sm:gap-4">
         {[
           { id: 'overview', icon: Layout, label: isArabic ? 'نظرة عامة' : 'Overview' },
           { id: 'leaderboard', icon: Trophy, label: isArabic ? 'الصابتون' : 'Sabitoon' },
           { id: 'reflections', icon: MessageCircle, label: isArabic ? 'تأملات' : 'Reflections' }
         ].map(tab => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={`flex items-center gap-2 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
               activeTab === tab.id 
                 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                 : 'bg-white/5 text-slate-500 hover:bg-white/10'
             }`}
           >
             <tab.icon className="h-4 w-4" />
             <span className="hidden sm:inline">{tab.label}</span>
           </button>
         ))}
      </div>

      <main>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
             <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
             <p className="text-slate-500 font-black animate-pulse uppercase text-xs tracking-widest">Gathering the Ummah...</p>
          </div>
        ) : (
          <div className="space-y-12">
             {activeTab === 'overview' && renderOverview()}
             {activeTab === 'leaderboard' && renderLeaderboard()}
             {activeTab === 'reflections' && renderReflections()}
          </div>
        )}
      </main>
    </div>
  );
};

export default CommunityDashboard;
