import React, { useState, useEffect } from 'react';
import { Award, Lock, Unlock, Shield, Zap, Target, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const titleToIconMap = {
  'Beginner': <Target className="w-5 h-5" />,
  'Consistent': <Zap className="w-5 h-5" />,
  'Warrior': <Shield className="w-5 h-5" />,
  'Halfway': <Star className="w-5 h-5" />,
  'Master': <Award className="w-5 h-5" />
};

const Achievements = ({ refreshTrigger }) => {
  const { t } = useTranslation();
  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Connect to generalized achievement matrix computation on backend
        const response = await api.get('/achievements');
        if (response.data.success) {
          setAchievements(response.data.achievements);
        }
      } catch (err) {
        console.error('Failed to fetch achievements:', err);
        setError('Unable to load achievements.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAchievements();
  }, [refreshTrigger]);

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-gray-100 p-6 shadow-sm min-h-[250px] flex items-center justify-center">
        <svg className="animate-spin h-6 w-6 text-primary opacity-50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-xl border border-gray-100 p-6 shadow-sm min-h-[250px] flex items-center justify-center">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-gray-100 p-6 shadow-sm h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium tracking-tight text-foreground">{t('achievements.title')}</h3>
        <Award className="h-5 w-5 text-secondary-foreground" />
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {(achievements || []).map((ach) => (
          <div 
            key={ach.title}
            className={`relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300
              ${ach.unlocked 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:shadow-md hover:-translate-y-1' 
                : 'bg-gray-50 border-gray-100 text-gray-400 opacity-60'}
            `}
          >
            {/* Contextual Lock Identifier */}
            <div className="absolute top-2 end-2">
              {ach.unlocked ? <Unlock className="w-3 h-3 text-emerald-500" /> : <Lock className="w-3 h-3 text-gray-300" />}
            </div>
            
            <div className={`p-3 rounded-full mb-2 ${ach.unlocked ? 'bg-emerald-100' : 'bg-gray-200'}`}>
              {titleToIconMap[ach.title] || <Award className="w-5 h-5" />}
            </div>
            <span className="text-sm font-medium text-center">{t(`achievements.names.${ach.title}`, ach.title)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Achievements;
