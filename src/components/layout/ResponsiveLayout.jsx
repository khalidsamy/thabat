import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import FloatingAssistantMenu from '../FloatingAssistantMenu';

// FloatingFAB removed — FloatingAssistantMenu is the sole mobile navigation surface.
// Having two floating buttons on screen at once creates a confusing UX hierarchy.
const ResponsiveLayout = () => (
  <div className="flex h-screen bg-background overflow-hidden">
    <Sidebar />

    <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
      <Navbar />

      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative">
        <div className="max-w-[1600px] mx-auto px-4 py-8 sm:px-6 lg:px-12 w-full">
          <Outlet />
        </div>
      </main>

      <FloatingAssistantMenu />
    </div>
  </div>
);

export default ResponsiveLayout;