import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar';
import BottomNav from '../BottomNav';
import Navbar from '../Navbar';

const ResponsiveLayout = () => {
  return (
    <div className="flex h-screen bg-background transition-colors duration-300 overflow-hidden">
      {/* Sidebar for Desktop/Tablet (md+) */}
      <Sidebar />

      {/* Main Container: Correct Content Isolation */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        <Navbar />

        {/* Scrollable Main Area */}
        <main className="flex-1 h-full overflow-y-auto overflow-x-hidden">
          <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-12 w-full">
            <Outlet />
          </div>
        </main>

        <BottomNav />
      </div>
    </div>
  );
};

export default ResponsiveLayout;
