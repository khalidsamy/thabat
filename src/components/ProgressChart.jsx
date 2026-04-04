import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';

const ProgressChart = ({ refreshTrigger }) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Connect directly to the backend /chart endpoint built in Milestone 2!
        const response = await api.get('/progress/chart');
        
        if (response.data.success) {
          // Format date for better visual display on X-Axis and tooltips
          const formattedData = response.data.chart.map(item => {
            const dateObj = new Date(item.date);
            return {
              ...item,
              // Convert "2026-04-03" -> "Apr 3" format natively without heavy libraries like date-fns
              displayDate: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            };
          });
          setData(formattedData);
        }
      } catch (err) {
        console.error('Failed to fetch chart data:', err);
        setError('Unable to securely load chart data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, [refreshTrigger]); // re-trigger fetch automatically whenever the parent Dashboard triggers a successful update!

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-gray-100 p-6 shadow-sm h-full flex flex-col items-center justify-center min-h-[300px]">
        <svg className="animate-spin h-8 w-8 text-primary opacity-50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-xl border border-gray-100 p-6 shadow-sm h-full flex flex-col items-center justify-center min-h-[300px]">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  // The AreaChart visually matches modern dashboards (Apple Health, Premium trackers)
  return (
    <div className="bg-card rounded-xl border border-gray-100 p-6 shadow-sm h-full flex flex-col">
      <h3 className="text-lg font-medium tracking-tight text-foreground mb-6">Memorization History</h3>
      
      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 0, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorPages" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/> {/* Emerald 500 equivalent */}
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="displayDate" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
              allowDecimals={false}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
              cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }}
            />
            <Area 
              type="monotone" 
              dataKey="pages" 
              name="Pages"
              stroke="#10b981" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorPages)" 
              activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProgressChart;
