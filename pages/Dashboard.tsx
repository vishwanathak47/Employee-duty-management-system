
import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store';
import { Gender, ShiftTime } from '../types';
import { Search, CheckCircle2, XCircle, Calendar as CalendarIcon, Clock, ChevronRight, History, X } from 'lucide-react';
import { formatToIST } from '../utils/ist';

const Dashboard: React.FC = () => {
  const { state, fetchDutiesByDate } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(formatToIST(new Date()));
  const [selectedEmpHistory, setSelectedEmpHistory] = useState<any>(null);

  useEffect(() => {
    fetchDutiesByDate(selectedDate);
  }, [fetchDutiesByDate, selectedDate]);

  const stats = useMemo(() => {
    const leaves = state.duties.filter(d => d.date === selectedDate && !d.isScheduled).length;
    return { leaves };
  }, [state.duties, selectedDate]);

  const getShiftStatus = (employeeId: string, shift: ShiftTime) => {
    const duty = state.duties.find(d => 
      (d.employeeId === employeeId || (d as any).employee === employeeId) && 
      d.date === selectedDate && 
      d.shiftTime === shift
    );
    
    if (!duty) return { type: 'none', text: 'Not Scheduled' };
    return { 
      type: duty.isScheduled ? 'scheduled' : 'leave', 
      text: duty.isScheduled ? 'Scheduled' : 'Unavailable' 
    };
  };

  const filteredEmployees = useMemo(() => {
    return state.employees
      .filter(emp => 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => (a.totalDutiesCount - b.totalDutiesCount) || a.name.localeCompare(b.name));
  }, [state.employees, searchTerm]);

  return (
    <div className="space-y-6 pb-24 sm:pb-8">
      {/* Header & Controls */}
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Deployment Board</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Monitoring site availability and shift coverage</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-64">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500" size={18} aria-hidden="true" />
            <input 
              type="date"
              aria-label="Select duty date"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
            <input 
              type="text"
              placeholder="Search staff database..."
              aria-label="Search staff members"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm dark:text-white transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <section className="grid grid-cols-2 gap-4" aria-label="Daily statistics summary">
        <StatCard label="Active Personnel" value={state.employees.length} color="indigo" />
        <StatCard label="Leaves/Off Today" value={stats.leaves} color="red" />
      </section>

      {/* Employee Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" aria-label="Staff deployment cards">
        {filteredEmployees.map(emp => {
          const empId = emp.id || (emp as any)._id;
          return (
            <article 
              key={empId} 
              onClick={() => setSelectedEmpHistory(emp)}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 hover:shadow-xl hover:border-indigo-100 dark:hover:border-indigo-500/50 transition-all cursor-pointer group flex flex-col h-full"
              role="button"
              tabIndex={0}
              aria-label={`View ${emp.name}'s duty history`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-1 rounded-full border-2 ${emp.gender === Gender.FEMALE ? 'border-sky-400' : 'border-orange-400'}`}>
                    <img 
                      src={emp.photoUrl} 
                      alt={`${emp.name} profile photo`} 
                      width="48" 
                      height="48" 
                      loading="lazy"
                      className="w-12 h-12 rounded-full object-cover" 
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{emp.name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{emp.employeeId}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-400 transition-colors" aria-hidden="true" />
              </div>

              <div className="flex-1 space-y-3">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-50 dark:border-slate-700 pb-1">Shift Availability</p>
                
                <div className="grid grid-cols-1 gap-2">
                  <ShiftBadge shift={ShiftTime.MORNING} status={getShiftStatus(empId, ShiftTime.MORNING)} />
                  <ShiftBadge shift={ShiftTime.AFTERNOON} status={getShiftStatus(empId, ShiftTime.AFTERNOON)} />
                  <ShiftBadge shift={ShiftTime.GENERAL} status={getShiftStatus(empId, ShiftTime.GENERAL)} />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-700 flex justify-between items-center text-[10px] font-bold">
                <span className="text-slate-400">TOTAL DUTIES</span>
                <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">{emp.totalDutiesCount}</span>
              </div>
            </article>
          );
        })}
      </section>

      {/* History Modal */}
      {selectedEmpHistory && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <img src={selectedEmpHistory.photoUrl} width="64" height="64" className="w-16 h-16 rounded-2xl border-2 border-white/20 object-cover shadow-lg" alt="" />
                <div>
                  <h2 className="text-2xl font-black tracking-tight">{selectedEmpHistory.name}</h2>
                  <p className="text-indigo-100 font-bold text-sm tracking-widest uppercase">{selectedEmpHistory.employeeId}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedEmpHistory(null)} 
                aria-label="Close profile modal"
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={24} aria-hidden="true" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2 mb-6">
                <History size={20} className="text-indigo-600" aria-hidden="true" />
                <h3 className="font-bold text-slate-800 dark:text-slate-200">Engagement History</h3>
              </div>
              
              <div className="space-y-3">
                {selectedEmpHistory.monthlyDuties.length === 0 ? (
                  <p className="text-center py-12 text-slate-400 font-medium">No performance records found.</p>
                ) : (
                  selectedEmpHistory.monthlyDuties.map((m: any, idx: number) => (
                    <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-center shadow-sm">
                      <span className="font-bold text-slate-700 dark:text-slate-200">{m.monthYear}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">SHIFTS COMPLETED</span>
                        <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-black">{m.count}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
              <button 
                onClick={() => setSelectedEmpHistory(null)}
                className="w-full bg-slate-900 dark:bg-slate-700 text-white font-bold py-4 rounded-2xl hover:bg-black dark:hover:bg-slate-600 transition-all shadow-lg active:scale-[0.98]"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, color, suffix = '' }: any) => {
  const colors: any = {
    indigo: 'from-indigo-500 to-indigo-700 shadow-indigo-100 dark:shadow-none',
    red: 'from-rose-500 to-rose-700 shadow-rose-100 dark:shadow-none',
    violet: 'from-violet-500 to-violet-700 shadow-violet-100 dark:shadow-none'
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} p-4 rounded-2xl text-white shadow-xl`}>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-80">{label}</p>
      <p className="text-2xl font-black mt-1">{value}{suffix}</p>
    </div>
  );
};

const ShiftBadge = ({ shift, status }: any) => {
  const getStyle = () => {
    if (status.type === 'scheduled') return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50';
    if (status.type === 'leave') return 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-900/50';
    return 'bg-slate-50 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-700';
  };

  const getIcon = () => {
    if (status.type === 'scheduled') return <CheckCircle2 size={14} aria-hidden="true" />;
    if (status.type === 'leave') return <XCircle size={14} aria-hidden="true" />;
    return <Clock size={14} aria-hidden="true" />;
  };

  const shortName = shift.includes('6am') ? 'Morning' : shift.includes('2pm') ? 'Afternoon' : 'General';

  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-xl border text-[11px] font-bold ${getStyle()}`}>
      <span className="opacity-80 uppercase tracking-tighter">{shortName}</span>
      <div className="flex items-center gap-1.5">
        <span>{status.text}</span>
        {getIcon()}
      </div>
    </div>
  );
};

export default Dashboard;
