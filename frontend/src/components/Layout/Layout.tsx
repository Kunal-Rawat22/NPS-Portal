import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout: React.FC = () => (
  <div className="flex flex-col h-screen">
    <Navbar />
    <div className="flex flex-1 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gray-50 p-6">
        <Outlet />
      </main>
    </div>
  </div>
);

export default Layout;
