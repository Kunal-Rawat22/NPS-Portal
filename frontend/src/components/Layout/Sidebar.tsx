import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { LayoutDashboard, ClipboardList, Users, BarChart3, Settings, Building2 } from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user } = useSelector((s: RootState) => s.auth);

  const navItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={18} />, to: '/dashboard', roles: ['ADMIN', 'BU_HEAD', 'HRBP', 'EMPLOYEE'] },
    { label: 'Surveys', icon: <ClipboardList size={18} />, to: '/surveys', roles: ['ADMIN', 'BU_HEAD', 'HRBP', 'EMPLOYEE'] },
    { label: 'Analytics', icon: <BarChart3 size={18} />, to: '/analytics', roles: ['ADMIN', 'BU_HEAD', 'HRBP'] },
    { label: 'Users', icon: <Users size={18} />, to: '/users', roles: ['ADMIN'] },
    { label: 'Business Units', icon: <Building2 size={18} />, to: '/business-units', roles: ['ADMIN'] },
    { label: 'Settings', icon: <Settings size={18} />, to: '/settings', roles: ['ADMIN'] },
  ];

  const visible = navItems.filter(item => user && item.roles.includes(user.role));

  return (
    <aside className="w-56 bg-white border-r border-gray-200 min-h-screen flex flex-col pt-4">
      <nav className="flex-1 px-3 space-y-1">
        {visible.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
