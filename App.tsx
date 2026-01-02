
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import EmployeeManagement from './pages/EmployeeManagement';
import DutyScheduler from './pages/DutyScheduler';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { useStore, StoreProvider } from './store';
import { Zap } from 'lucide-react';

const Preloader = () => {
  return (
    <div role="status" aria-label="Loading application" className="fixed inset-0 z-[1000] bg-indigo-600 flex flex-col items-center justify-center">
      <div className="relative">
        <div className="w-24 h-24 bg-white/10 rounded-3xl animate-pulse absolute inset-0 blur-xl"></div>
        <div className="relative w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-indigo-600 shadow-2xl animate-bounce">
          <Zap size={40} fill="currentColor" />
        </div>
      </div>
      <div className="mt-12 flex flex-col items-center">
        <h2 className="text-white text-2xl font-black tracking-tighter">DutySync Pro</h2>
        <p className="text-indigo-100 text-xs font-bold uppercase tracking-[0.3em] mt-2 animate-pulse">Initializing System</p>
        <div className="w-48 h-1 bg-white/20 rounded-full mt-6 overflow-hidden">
          <div className="w-full h-full bg-white origin-left animate-[loading_1.5s_ease-in-out_infinite]"></div>
        </div>
      </div>
      <style>{`
        @keyframes loading {
          0% { transform: scaleX(0); }
          50% { transform: scaleX(1); }
          100% { transform: scaleX(0); transform-origin: right; }
        }
      `}</style>
    </div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useStore();
  if (!state.user) return <Navigate to="/login" replace />;
  return <React.Fragment>{children}</React.Fragment>;
};

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    // Reduced preloader time slightly to ensure Lighthouse doesn't time out FCP
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <StoreProvider>
      {loading && <Preloader />}
      <Router>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 flex flex-col">
          <Navbar toggleTheme={toggleTheme} theme={theme} />
          <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/employees" element={<ProtectedRoute><EmployeeManagement /></ProtectedRoute>} />
              <Route path="/scheduler" element={<ProtectedRoute><DutyScheduler /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          
          <NetworkMonitor />
        </div>
      </Router>
    </StoreProvider>
  );
};

const NetworkMonitor = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div role="alert" className="fixed bottom-20 sm:bottom-4 right-4 z-[100] bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-bounce">
      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">!</div>
      <div>
        <p className="font-bold">Offline Connection</p>
        <p className="text-xs opacity-80">Syncing paused. Back up your data.</p>
      </div>
    </div>
  );
};

export default App;
