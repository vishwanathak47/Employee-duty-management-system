
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
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [state.employees, searchTerm]);

  const stats = useMemo(() => {
    const working = state.duties.filter(d => d.date === selectedDate && d.isScheduled).length;
    const leaves = state.duties.filter(d => d.date === selectedDate && !d.isScheduled).length;
    return { working, leaves };
  }, [state.duties, selectedDate]);

  return (
    <div className="space-y-6 pb-24 sm:pb-8">
      {/* Header & Controls */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Deployment Board</h1>
          <p className="text-slate-500 font-medium">Monitoring site availability and shift coverage</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-64">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500" size={18} />
            <input 
              type="date"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm font-semibold text-slate-700"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search staff database..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Staff" value={state.employees.length} color="indigo" />
        <StatCard label="Working Today" value={stats.working} color="green" />
        <StatCard label="Leaves/Off" value={stats.leaves} color="red" />
        <StatCard label="Coverage %" value={state.employees.length ? Math.round((stats.working / (state.employees.length * 2)) * 100) : 0} suffix="%" color="violet" />
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredEmployees.map(emp => {
          const empId = emp.id || (emp as any)._id;
          return (
            <div 
              key={empId} 
              onClick={() => setSelectedEmpHistory(emp)}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-xl hover:border-indigo-100 transition-all cursor-pointer group flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-1 rounded-full border-2 ${emp.gender === Gender.FEMALE ? 'border-sky-400' : 'border-orange-400'}`}>
                    <img src={emp.photoUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{emp.name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{emp.employeeId}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
              </div>

              <div className="flex-1 space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-1">Shift Availability</p>
                
                <div className="grid grid-cols-1 gap-2">
                  <ShiftBadge shift={ShiftTime.MORNING} status={getShiftStatus(empId, ShiftTime.MORNING)} />
                  <ShiftBadge shift={ShiftTime.AFTERNOON} status={getShiftStatus(empId, ShiftTime.AFTERNOON)} />
                  <ShiftBadge shift={ShiftTime.GENERAL} status={getShiftStatus(empId, ShiftTime.GENERAL)} />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center text-[10px] font-bold">
                <span className="text-slate-400">TOTAL DUTIES</span>
                <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{emp.totalDutiesCount}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* History Modal */}
      {selectedEmpHistory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <img src={selectedEmpHistory.photoUrl} className="w-16 h-16 rounded-2xl border-2 border-white/20 object-cover shadow-lg" alt="" />
                <div>
                  <h2 className="text-2xl font-black tracking-tight">{selectedEmpHistory.name}</h2>
                  <p className="text-indigo-100 font-bold text-sm tracking-widest uppercase">{selectedEmpHistory.employeeId}</p>
                </div>
              </div>
              <button onClick={() => setSelectedEmpHistory(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
              <div className="flex items-center gap-2 mb-6">
                <History size={20} className="text-indigo-600" />
                <h3 className="font-bold text-slate-800">Engagement History</h3>
              </div>
              
              <div className="space-y-3">
                {selectedEmpHistory.monthlyDuties.length === 0 ? (
                  <p className="text-center py-12 text-slate-400 font-medium">No performance records found.</p>
                ) : (
                  selectedEmpHistory.monthlyDuties.map((m: any, idx: number) => (
                    <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 flex justify-between items-center shadow-sm">
                      <span className="font-bold text-slate-700">{m.monthYear}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">SHIFTS COMPLETED</span>
                        <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-black">{m.count}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-white">
              <button 
                onClick={() => setSelectedEmpHistory(null)}
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-black transition-all shadow-lg active:scale-[0.98]"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredEmployees.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <Search size={64} className="mb-4 opacity-10" />
          <p className="text-xl font-bold tracking-tight">No staff members found matching search</p>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, color, suffix = '' }: any) => {
  const colors: any = {
    indigo: 'from-indigo-500 to-indigo-700 shadow-indigo-100',
    green: 'from-emerald-500 to-emerald-700 shadow-emerald-100',
    red: 'from-rose-500 to-rose-700 shadow-rose-100',
    violet: 'from-violet-500 to-violet-700 shadow-violet-100'
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
    if (status.type === 'scheduled') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (status.type === 'leave') return 'bg-rose-50 text-rose-700 border-rose-100';
    return 'bg-slate-50 text-slate-400 border-slate-100';
  };

  const getIcon = () => {
    if (status.type === 'scheduled') return <CheckCircle2 size={14} />;
    if (status.type === 'leave') return <XCircle size={14} />;
    return <Clock size={14} />;
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
