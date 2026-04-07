// Tailwind purges dynamic class strings like `lg:col-span-${n}`.
// Every span variant must appear as a complete literal string in source.
const SPAN = {
  4:  'lg:col-span-4',
  5:  'lg:col-span-5',
  6:  'lg:col-span-6',
  7:  'lg:col-span-7',
  8:  'lg:col-span-8',
  12: 'lg:col-span-12',
};

const DashboardLayout = ({ children }) => (
  <div className="w-full max-w-[1600px] mx-auto">
    <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-12 lg:gap-7">
      {children}
    </div>
  </div>
);

DashboardLayout.Item = ({ cols = 12, className = '', children }) => (
  <div className={`min-w-0 ${SPAN[cols] ?? 'lg:col-span-12'} ${className}`}>
    {children}
  </div>
);

export default DashboardLayout;
