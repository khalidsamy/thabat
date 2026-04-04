import React from 'react';
import Sidebar from '../Sidebar';
import BottomNav from '../BottomNav';
import Navbar from '../Navbar';

const ResponsiveLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-background transition-colors duration-300">
      {/* Sidebar for Desktop/Tablet (md+) */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-1 relative">
          <div className="max-w-7xl mx-auto w-full h-full">
            {children}
          </div>
        </main>

        {/* Bottom Nav for Mobile (below md) */}
        <BottomNav />
      </div>
    </div>
  );
};

export default ResponsiveLayout;
