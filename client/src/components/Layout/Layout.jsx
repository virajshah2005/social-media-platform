import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

const Layout = () => {
  return (
    <div className="min-h-screen bg-social-bg">
      {/* Desktop Layout */}
      <div className="hidden md:flex">
        <Sidebar />
        <main className="flex-1 ml-64 min-h-screen">
          <div className="max-w-2xl mx-auto py-6 px-4">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <main className="min-h-screen pb-20">
          <div className="py-4 px-4">
            <Outlet />
          </div>
        </main>
        <MobileNav />
      </div>
    </div>
  );
};

export default Layout; 