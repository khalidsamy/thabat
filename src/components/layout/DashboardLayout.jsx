import React from 'react';

const DashboardLayout = ({ children }) => {
  return (
    <div className="w-full max-w-[1600px] mx-auto animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-10">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
