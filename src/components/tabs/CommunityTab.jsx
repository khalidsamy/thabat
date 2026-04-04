import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageCircle, Heart, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Button from '../Button';

const CommunityTab = ({ progress, itemVariants }) => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const [reflections, setReflections] = useState([]);
  const [newReflection, setNewReflection] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReflections = async () => {
    try {
      const response = await api.get('/community');
      if (response.data.success) {
        setReflections(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch reflections:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReflections();
  }, []);

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
    try {
      const response = await api.post(`/community/dua/${id}`);
      if (response.data.success) {
        showSuccess(t('community.prayed'));
        // Local update to avoid re-fetch
        setReflections(prev => prev.map(r => 
          r._id === id ? { ...r, duaCount: r.duaCount + 1, duas: [...(r.duas || []), 'me'] } : r
        ));
      }
    } catch (err) {
      showError(err.response?.data?.message || err.message);
    }
  };

  // Logic: User can post only if daily goal reached
  const canPost = progress?.doneToday >= progress?.dailyTarget;

  return (
    <div className="space-y-8 pb-32">
      <motion.section variants={itemVariants} className="text-center max-w-2xl mx-auto py-4">
        <h2 className="text-3xl font-extrabold text-foreground mb-2">{t('community.title')}</h2>
        <p className="text-secondary-foreground opacity-70">{t('community.subtitle')}</p>
      </motion.section>

      {/* Post Reflection Section */}
      <motion.section variants={itemVariants} className="max-w-2xl mx-auto w-full">
        <div className={`bg-card rounded-[2rem] border-2 p-8 shadow-xl transition-all duration-500 ${
          canPost ? 'border-emerald-500/20 shadow-emerald-500/5' : 'border-amber-500/20 bg-amber-500/5 opacity-80'
        }`}>
          {!canPost ? (
            <div className="text-center space-y-4">
               <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-amber-600" />
               </div>
               <p className="text-amber-800 dark:text-amber-200 font-bold">
                 {t('community.goal_required')}
               </p>
            </div>
          ) : (
            <form onSubmit={handlePostReflection} className="space-y-4">
              <textarea
                value={newReflection}
                onChange={(e) => setNewReflection(e.target.value)}
                placeholder={t('community.placeholder')}
                maxLength={200}
                className="w-full h-32 bg-slate-50 dark:bg-slate-900 shadow-inner rounded-2xl p-4 text-foreground border-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none font-medium"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">
                  {newReflection.length}/200
                </span>
                <Button 
                  type="submit" 
                  disabled={isPosting || !newReflection.trim()} 
                  isLoading={isPosting}
                  className="px-8"
                >
                  <Send className="h-4 w-4 me-2" />
                  {t('community.post')}
                </Button>
              </div>
            </form>
          )}
        </div>
      </motion.section>

      {/* Reflections Feed */}
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
                className="group bg-card hover:bg-emerald-50/30 dark:hover:bg-emerald-500/5 border border-gray-100 dark:border-white/5 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:border-emerald-500/20 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                       <div className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center text-[10px] font-black text-emerald-600">
                          {reflection.userName.charAt(0).toUpperCase()}
                       </div>
                       <span className="text-sm font-black text-foreground opacity-80">{reflection.userName}</span>
                       <span className="text-[10px] text-slate-400">• {new Date(reflection.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-foreground leading-relaxed font-medium">
                      {reflection.content}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAddDua(reflection._id)}
                    className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-2xl transition-all ${
                      reflection.duas?.includes('me') 
                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' 
                        : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                    }`}
                  >
                    <span className="text-sm font-bold">{reflection.duaCount}</span>
                    <Heart className={`h-4 w-4 ${reflection.duas?.includes('me') ? 'fill-white' : ''}`} />
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

export default CommunityTab;
