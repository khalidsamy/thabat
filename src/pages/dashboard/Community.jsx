import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { Sparkles, MessageCircle, Heart, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/Button';

const Community = (props) => {
  const { t } = useTranslation();
  const context = useOutletContext() || {};
  const { progress, user, itemVariants } = { 
    progress: {}, 
    user: {}, 
    ...context, 
    ...props 
  };
  const { showSuccess, showError } = useToast();
  const [reflections, setReflections] = useState([]);
  const [newReflection, setNewReflection] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const currentUserId = user?._id;

  const hasCurrentUserDua = useCallback((reflection) => (
    reflection?.duas?.some((duaEntry) => {
      if (!duaEntry) return false;
      if (typeof duaEntry === 'string') return duaEntry === currentUserId || duaEntry === 'me';
      return duaEntry._id === currentUserId;
    })
  ), [currentUserId]);

  const fetchReflections = useCallback(async () => {
    try {
      const response = await api.get('/community');
      if (response.data.success) {
        setReflections(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch reflections:', err);
      showError(t('dashboard.fetch_error'));
    } finally {
      setIsLoading(false);
    }
  }, [showError, t]);

  useEffect(() => {
    void fetchReflections();
  }, [fetchReflections]);

  const handlePostReflection = async (e) => {
    e.preventDefault();
    if (!newReflection.trim() || newReflection.length > 200) return;

    setIsPosting(true);
    try {
      const response = await api.post('/community/reflect', { content: newReflection });
      if (response.data.success) {
        setNewReflection('');
        showSuccess(t('community.post_success') || 'Reflection shared!');
        await fetchReflections();
      }
    } catch (err) {
      showError(err.response?.data?.message || err.message);
    } finally {
      setIsPosting(false);
    }
  };

  const handleAddDua = async (id) => {
    const reflection = reflections.find(r => r._id === id);
    if (hasCurrentUserDua(reflection)) return;

    setReflections(prev => prev.map(r => 
      r._id === id ? { 
        ...r, 
        duaCount: r.duaCount + 1, 
        duas: [...(r.duas || []), currentUserId || 'me'] 
      } : r
    ));

    try {
      const response = await api.post(`/community/dua/${id}`);
      if (response.data.success) {
        showSuccess(t('community.prayed'));
      }
    } catch (err) {
      setReflections(prev => prev.map(r => 
        r._id === id ? { 
          ...r, 
          duaCount: r.duaCount - 1, 
          duas: (r.duas || []).filter(u => u !== (currentUserId || 'me')) 
        } : r
      ));
      showError(err.response?.data?.message || err.message);
    }
  };

  const canPost = progress?.doneToday >= progress?.dailyTarget;

  return (
    <div className="space-y-12 pb-32 animate-fade-in bg-background min-h-screen">
      <motion.section variants={itemVariants} className="text-center max-w-2xl mx-auto py-8">
        <h2 className="text-4xl font-black text-foreground tracking-tight mb-4 uppercase">{t('community.title')}</h2>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] leading-relaxed">{t('community.subtitle')}</p>
      </motion.section>

      <motion.section variants={itemVariants} className="max-w-2xl mx-auto w-full">
        <div className={`bg-card/40 rounded-3xl border border-white/5 p-10 shadow-xl shadow-black/20 transition-all duration-500 ${
          canPost ? 'shadow-emerald-500/5' : 'bg-amber-500/5 opacity-90'
        }`}>
          {!canPost ? (
            <div className="text-center space-y-6">
               <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Sparkles className="h-10 w-10 text-amber-500" />
               </div>
               <p className="text-amber-200 font-black text-lg uppercase tracking-tight">
                 {t('community.goal_required')}
               </p>
               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed">Complete your daily Hifz target to unlock spiritual sharing.</p>
            </div>
          ) : (
            <form onSubmit={handlePostReflection} className="space-y-6">
              <textarea
                value={newReflection}
                onChange={(e) => setNewReflection(e.target.value)}
                placeholder={t('community.placeholder')}
                maxLength={200}
                className="w-full h-40 bg-slate-900 shadow-inner rounded-3xl p-6 text-foreground border-none focus:ring-4 focus:ring-emerald-500/10 transition-all resize-none font-bold text-xl leading-relaxed text-center"
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {newReflection.length} / 200 CHARACTERS
                </span>
                <Button 
                  type="submit" 
                  disabled={isPosting || !newReflection.trim()} 
                  isLoading={isPosting}
                  className="h-14 px-10 rounded-2xl bg-white text-zinc-950 font-black uppercase tracking-widest shadow-xl shadow-black/20 active:scale-95 transition-all hover:bg-slate-100"
                >
                  <Send className="h-4 w-4 me-3" />
                  {t('community.post')}
                </Button>
              </div>
            </form>
          )}
        </div>
      </motion.section>

      <motion.section variants={itemVariants} className="max-w-2xl mx-auto w-full space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
          </div>
        ) : reflections.length === 0 ? (
          <div className="text-center py-12 opacity-50">
            <MessageCircle className="h-12 w-12 mx-auto mb-4" />
            <p className="font-medium">{t('community.no_reflections')}</p>
          </div>
        ) : (
          <AnimatePresence>
            {reflections.map((reflection, index) => (
              <motion.div
                key={reflection._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-card/40 hover:bg-emerald-500/5 border border-white/5 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:border-emerald-500/20 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                       <div className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center text-[10px] font-black text-emerald-400">
                          {reflection.userName.charAt(0).toUpperCase()}
                       </div>
                       <span className="text-sm font-black text-foreground opacity-80">{reflection.userName}</span>
                        <span className="text-[10px] text-slate-500">• {new Date(reflection.createdAt).toLocaleDateString()}</span>
                        {new Date() - new Date(reflection.createdAt) < 3600000 && (
                          <span className="flex items-center gap-1.5 ms-2">
                             <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                             </span>
                             <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter">Live</span>
                          </span>
                        )}
                    </div>
                    <p className="text-foreground leading-relaxed font-medium">
                      {reflection.content}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAddDua(reflection._id)}
                    className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-2xl transition-all ${
                      hasCurrentUserDua(reflection)
                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' 
                        : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                    }`}
                  >
                    <span className="text-sm font-bold">{reflection.duaCount}</span>
                    <Heart className={`h-4 w-4 ${hasCurrentUserDua(reflection) ? 'fill-white' : ''}`} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </motion.section>
    </div>
  );
};

export default Community;
