
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { LayoutDashboard, Users, CalendarDays, BarChart3, LogOut, Zap } from 'lucide-react';

const Logo = () => (
  <div className="flex items-center gap-3">
    <div className="relative flex items-center justify-center">
      <div className="absolute inset-0 bg-indigo-600 blur-lg opacity-20 rounded-full animate-pulse"></div>
      <div className="relative w-10 h-10 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 rounded-xl flex items-center justify-center text-white shadow-xl rotate-3 hover:rotate-0 transition-transform cursor-pointer">
        <Zap size={22} fill="white" strokeWidth={0} />
      </div>
    </div>
    <div className="flex flex-col">
      <span className="text-xl font-black tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent leading-none">
        DutySync
      </span>
      <span className="text-[10px] font-bold text-indigo-600 tracking-[0.2em] uppercase">
        Professional
      </span>
    </div>
  </div>
);

const Navbar: React.FC = () => {
  const { state, logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!state.user) return null;

  return (
    <>
      {/* Desktop Top Navbar */}
      <nav className="hidden sm:block bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center gap-12">
              <Logo />
              <div className="flex space-x-1">
                <NavItem to="/" icon={<LayoutDashboard size={18} />} label="Dashboard" />
                <NavItem to="/employees" icon={<Users size={18} />} label="Staff" />
                <NavItem to="/scheduler" icon={<CalendarDays size={18} />} label="Scheduler" />
                <NavItem to="/reports" icon={<BarChart3 size={18} />} label="Analytics" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-900">{state.user.name}</p>
                <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Site Supervisor</p>
              </div>
              <button 
                onClick={handleLogout}
                className="group p-2.5 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300"
                title="Sign Out"
              >
                <LogOut size={20} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navbar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-slate-200 pb-safe-area-inset-bottom">
        <div className="flex justify-around items-center px-4 py-3">
          <MobileNavItem to="/" icon={<LayoutDashboard size={24} />} label="Home" />
          <MobileNavItem to="/employees" icon={<Users size={24} />} label="Staff" />
          <MobileNavItem to="/scheduler" icon={<CalendarDays size={24} />} label="Schedules" />
          <MobileNavItem to="/reports" icon={<BarChart3 size={24} />} label="Stats" />
          <button 
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 text-slate-400 p-2"
          >
            <LogOut size={24} />
            <span className="text-[10px] font-bold">Exit</span>
          </button>
        </div>
      </nav>
    </>
  );
};

const NavItem = ({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `
      flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
      ${isActive 
        ? 'text-indigo-600 bg-indigo-50 shadow-sm shadow-indigo-100/50' 
        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
      }
    `}
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

const MobileNavItem = ({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `
      flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all
      ${isActive 
        ? 'text-indigo-600 scale-110' 
        : 'text-slate-400'
      }
    `}
  >
    {icon}
    <span className="text-[10px] font-bold tracking-tight uppercase">{label}</span>
  </NavLink>
);

export default Navbar;
