import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import FloatingFAB from '../FloatingFAB';
import FloatingAssistantMenu from '../FloatingAssistantMenu';

const ResponsiveLayout = () => {
  const location = useLocation();
  const isDashboardHome = location.pathname === '/dashboard';
  const isRecite = location.pathname === '/dashboard/recite';

  return (
    <div className="flex h-screen bg-background transition-colors duration-500 overflow-hidden font-tajawal">
      {/* Sidebar for Desktop/Tablet (md+) */}
      <Sidebar />

      {/* Main Container: Correct Content Isolation */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        <Navbar />

        {/* Scrollable Main Area */}
        <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative">
          <div className="max-w-[1600px] mx-auto px-4 py-8 sm:px-6 lg:px-12 w-full">
            <Outlet />
          </div>

          {/* Global Floating Actions synchronized with image_6.png */}
          {(isDashboardHome || isRecite) && (
            <FloatingFAB 
                label="Spiritual Insight" 
                onClick={() => console.log('Spiritual Stats Triggered')} 
            />
          )}
        </main>

        {/* New Mobile Floating Assistant Menu */}
        <FloatingAssistantMenu />
      </div>
    </div>
  );
};

export default ResponsiveLayout;
