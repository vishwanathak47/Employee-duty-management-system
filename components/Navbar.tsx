
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { LayoutDashboard, Users, CalendarDays, BarChart3, LogOut } from 'lucide-react';

const Navbar: React.FC = () => {
  const { state, logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!state.user) return null;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">D</div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent hidden sm:block">
                DutySync Pro
              </span>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
              <NavItem to="/" icon={<LayoutDashboard size={18} />} label="Dashboard" />
              <NavItem to="/employees" icon={<Users size={18} />} label="Employees" />
              <NavItem to="/scheduler" icon={<CalendarDays size={18} />} label="Scheduler" />
              <NavItem to="/reports" icon={<BarChart3 size={18} />} label="Reports" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600 hidden md:block">
              Welcome, {state.user.name}
            </span>
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Nav */}
      <div className="sm:hidden border-t border-slate-100 flex justify-around py-2">
         <NavItem to="/" icon={<LayoutDashboard size={18} />} label="Home" mobile />
         <NavItem to="/employees" icon={<Users size={18} />} label="Staff" mobile />
         <NavItem to="/scheduler" icon={<CalendarDays size={18} />} label="Schedules" mobile />
         <NavItem to="/reports" icon={<BarChart3 size={18} />} label="Stats" mobile />
      </div>
    </nav>
  );
};

const NavItem = ({ to, icon, label, mobile = false }: { to: string, icon: React.ReactNode, label: string, mobile?: boolean }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `
      flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all
      ${isActive 
        ? 'text-indigo-600 bg-indigo-50 sm:bg-indigo-50' 
        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
      }
      ${mobile ? 'text-[10px]' : ''}
    `}
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

export default Navbar;
