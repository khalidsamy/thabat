import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import FloatingAssistantMenu from '../FloatingAssistantMenu';

// FloatingFAB removed — FloatingAssistantMenu is the sole mobile navigation surface.
// Having two floating buttons on screen at once creates a confusing UX hierarchy.
const ResponsiveLayout = () => (
  <div className="page-shell flex h-screen overflow-hidden bg-background">
    <Sidebar />

    <div className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden">
      <Navbar />

      <main className="relative h-full flex-1 overflow-y-auto overflow-x-hidden">
        <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-12">
          <Outlet />
        </div>
      </main>

      <FloatingAssistantMenu />
    </div>
  </div>
);

export default ResponsiveLayout;
