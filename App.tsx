
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import EmployeeManagement from './pages/EmployeeManagement';
import DutyScheduler from './pages/DutyScheduler';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { useStore, StoreProvider } from './store';

// Fix: Access state from global context
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { state } = useStore();
  if (!state.user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
    <div className="fixed bottom-4 right-4 z-[100] bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-bounce">
      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">!</div>
      <div>
        <p className="font-bold">Offline Connection</p>
        <p className="text-xs opacity-80">Working in limited mode. Sync when back online.</p>
      </div>
    </div>
  );
};

export default App;
