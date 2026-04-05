const DashboardLayout = ({ children }) => (
  <div className="w-full max-w-[1600px] mx-auto">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
      {children}
    </div>
  </div>
);

// Usage: <DashboardLayout.Item cols={8}> or cols={4} or cols={12}
// Tailwind requires full class strings — avoid dynamic `col-span-${n}` interpolation
const colMap = {
  4:  'lg:col-span-4',
  5:  'lg:col-span-5',
  6:  'lg:col-span-6',
  7:  'lg:col-span-7',
  8:  'lg:col-span-8',
  12: 'lg:col-span-12',
};

DashboardLayout.Item = ({ children, cols = 12, className = '' }) => (
  <div className={`${colMap[cols] ?? 'lg:col-span-12'} ${className}`}>
    {children}
  </div>
);

export default DashboardLayout;