import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const ProgressChart = ({ refreshTrigger }) => {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await api.get('/progress/chart');
        if (res.data.success) {
          setData(
            (res.data.chart || []).map(item => ({
              ...item,
              displayDate: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            }))
          );
        }
      } catch {
        setError('Unable to load chart data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [refreshTrigger]);

  if (isLoading) {
    return (
      <div className="bg-card/40 rounded-3xl border border-white/5 p-8 shadow-xl shadow-black/40 flex items-center justify-center" style={{ height: 400 }}>
        <svg className="animate-spin h-10 w-10 text-emerald-500 opacity-50" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card/40 rounded-3xl border border-white/5 p-8 shadow-xl shadow-black/40 flex items-center justify-center" style={{ height: 400 }}>
        <p className="text-sm font-bold text-rose-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-card/40 rounded-3xl border border-white/5 p-8 lg:p-10 shadow-xl shadow-black/40">
      <h3 className="text-xl font-black text-foreground mb-8 uppercase tracking-widest">
        {t('chart.title')}
      </h3>

      {/* Fixed pixel height — ResponsiveContainer cannot measure a percentage
          height from a flex parent that has no explicit size set. */}
      <div style={{ width: '100%', height: 360 }}>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPages" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
              <XAxis
                dataKey="displayDate"
                axisLine={false} tickLine={false}
                tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10}
              />
              <YAxis
                axisLine={false} tickLine={false}
                tick={{ fontSize: 12, fill: '#94a3b8' }} allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px', border: '1px solid #1e293b',
                  backgroundColor: '#0f172a', color: '#f8fafc',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                }}
                cursor={{ stroke: '#334155', strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              <Area
                type="monotone" dataKey="pages" name={t('dashboard.pages')}
                stroke="#10b981" strokeWidth={3}
                fillOpacity={1} fill="url(#colorPages)"
                activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
            <p className="text-sm font-medium text-slate-500">{t('chart.no_data')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressChart;