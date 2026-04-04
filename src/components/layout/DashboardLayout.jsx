import React from 'react';

const DashboardLayout = ({ children }) => {
  return (
    <div className="w-full max-w-[1600px] mx-auto animate-fade-in group/layout">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
