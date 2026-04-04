import React, { useState, useEffect, useContext } from 'react';
import { Trophy, Medal, Crown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Leaderboard = () => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext); // Inject active user context to compare rank!
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // This endpoint intrinsically strips inactive users and limits the size on backend
        const response = await api.get('/leaderboard');
        if (response.data.success) {
          setLeaderboard(response.data.leaderboard);
        }
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
        setError('Unable to load leaderboard data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []); // Only fetch initially when mounting

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-gray-100 p-6 shadow-sm min-h-[300px] flex items-center justify-center">
        <svg className="animate-spin h-6 w-6 text-primary opacity-50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-xl border border-gray-100 p-6 shadow-sm min-h-[300px] flex items-center justify-center">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  // Generate visual rank emblems
  const getRankIndicator = (index) => {
    switch(index) {
      case 0: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 1: return <Medal className="w-5 h-5 text-gray-400" />;
      case 2: return <Medal className="w-5 h-5 text-amber-700" />;
      default: return <span className="text-sm font-medium text-secondary-foreground w-5 text-center">{index + 1}</span>;
    }
  };

  return (
    <div className="bg-card rounded-xl border border-gray-100 p-6 shadow-sm h-full flex flex-col max-h-[500px]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium tracking-tight text-foreground">{t('leaderboard.title')}</h3>
        <Trophy className="h-5 w-5 text-yellow-500" />
      </div>

      <div className="flow-root overflow-y-auto pe-2 custom-scrollbar">
        <ul className="-my-5 divide-y divide-gray-100">
          {(leaderboard || []).map((entry, index) => {
            // Evaluates securely against the context
            const isTargetUser = user && user.name === entry.name; 
            
            return (
              <li key={index} className={`py-4 transition-all duration-200 hover:bg-gray-50 -mx-4 px-4 rounded-lg ${isTargetUser ? 'bg-primary/5 border border-primary/20' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center w-8">
                    {getRankIndicator(index)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate flex items-center ${isTargetUser ? 'text-primary' : 'text-foreground'}`}>
                      {entry.name} 
                      {isTargetUser && <span className="ms-2 text-[10px] bg-primary text-white px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">{t('leaderboard.you')}</span>}
                    </p>
                    <p className="text-xs text-secondary-foreground truncate mt-0.5">
                      {t('leaderboard.longest_streak')} {entry.longestStreak} {t('leaderboard.days')}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="inline-flex items-center text-sm font-bold text-emerald-600">
                      {entry.totalMemorized}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-secondary-foreground">{t('leaderboard.pages')}</span>
                  </div>
                </div>
              </li>
            );
          })}
          
          {leaderboard.length === 0 && (
            <div className="py-12 flex items-center justify-center">
              <p className="text-sm text-secondary-foreground text-center">{t('leaderboard.no_records')}</p>
            </div>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Leaderboard;
