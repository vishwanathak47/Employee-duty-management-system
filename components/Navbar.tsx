
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { LayoutDashboard, Users, CalendarDays, BarChart3, LogOut, Zap, Sun, Moon } from 'lucide-react';

const Logo = () => (
  <div className="flex items-center gap-3">
    <div className="relative flex items-center justify-center">
      <div className="absolute inset-0 bg-indigo-600 blur-lg opacity-20 rounded-full animate-pulse"></div>
      <div className="relative w-10 h-10 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 rounded-xl flex items-center justify-center text-white shadow-xl rotate-3 hover:rotate-0 transition-transform cursor-pointer">
        <Zap size={22} fill="white" strokeWidth={0} />
      </div>
    </div>
    <div className="flex flex-col">
      <span className="text-xl font-black tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent leading-none transition-colors">
        DutySync
      </span>
      <span className="text-[10px] font-bold text-indigo-600 tracking-[0.2em] uppercase">
        Professional
      </span>
    </div>
  </div>
);

interface NavbarProps {
  toggleTheme: () => void;
  theme: string;
}

const Navbar: React.FC<NavbarProps> = ({ toggleTheme, theme }) => {
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
      <nav className="hidden sm:block bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors">
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
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleTheme}
                className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{state.user.name}</p>
                <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Site Supervisor</p>
              </div>
              <button 
                onClick={handleLogout}
                className="group p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-300"
                title="Sign Out"
              >
                <LogOut size={20} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navbar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 pb-safe-area-inset-bottom transition-colors">
        <div className="flex justify-around items-center px-2 py-3">
          <MobileNavItem to="/" icon={<LayoutDashboard size={22} />} label="Home" />
          <MobileNavItem to="/employees" icon={<Users size={22} />} label="Staff" />
          <button 
            onClick={toggleTheme}
            className="flex flex-col items-center gap-1 text-slate-400 p-2"
          >
            {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
            <span className="text-[10px] font-bold uppercase">Theme</span>
          </button>
          <MobileNavItem to="/scheduler" icon={<CalendarDays size={22} />} label="Shift" />
          <MobileNavItem to="/reports" icon={<BarChart3 size={22} />} label="Stats" />
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
        ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm shadow-indigo-100/50' 
        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
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
      flex flex-col items-center gap-1 p-1.5 rounded-2xl transition-all min-w-[60px]
      ${isActive 
        ? 'text-indigo-600 scale-110' 
        : 'text-slate-400 dark:text-slate-500'
      }
    `}
  >
    {icon}
    <span className="text-[9px] font-bold tracking-tight uppercase">{label}</span>
  </NavLink>
);

export default Navbar;
