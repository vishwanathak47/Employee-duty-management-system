
import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store';
import { Gender } from '../types';
import { Search, CheckCircle2, XCircle } from 'lucide-react';
import { formatToIST, getCurrentMonthYear } from '../utils/ist';

const Dashboard: React.FC = () => {
  const { state, fetchDutiesByDate } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const today = formatToIST(new Date());

  // Fix: Ensure dashboard displays real-time data from the server
  useEffect(() => {
    fetchDutiesByDate(today);
  }, [fetchDutiesByDate, today]);

  const getTodayStatus = (employeeId: string) => {
    const todayDuties = state.duties.filter(d => (d.employeeId === employeeId || (d as any).employee === employeeId) && d.date === today);
    if (todayDuties.length === 0) return { available: true, text: 'No Schedule' };
    
    const scheduledCount = todayDuties.filter(d => d.isScheduled).length;
    const leaveCount = todayDuties.filter(d => !d.isScheduled).length;

    if (leaveCount > 0 && scheduledCount === 0) return { available: false, text: 'On Leave' };
    return { available: true, text: scheduledCount > 0 ? `${scheduledCount} Shift(s)` : 'Available' };
  };

  const filteredEmployees = useMemo(() => {
    return state.employees
      .filter(emp => 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        const aStatus = getTodayStatus(a.id || (a as any)._id).available;
        const bStatus = getTodayStatus(b.id || (b as any)._id).available;
        if (aStatus === bStatus) return a.name.localeCompare(b.name);
        return aStatus ? -1 : 1;
      });
  }, [state.employees, searchTerm, state.duties, today]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Live Dashboard</h1>
          <p className="text-slate-500 text-sm">Today: {formatToIST(new Date(), 'EEEE, MMMM do, yyyy')}</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search by name or Employee ID..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredEmployees.map(emp => {
          const empId = emp.id || (emp as any)._id;
          const status = getTodayStatus(empId);
          const currentMonthYear = getCurrentMonthYear();
          const monthlyCount = emp.monthlyDuties?.find(m => m.monthYear === currentMonthYear)?.count || 0;

          return (
            <div key={empId} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md hover:-translate-y-1 transition-all group">
              <div className="flex flex-col items-center">
                <div className={`relative p-1 rounded-full border-4 transition-colors ${emp.gender === Gender.FEMALE ? 'border-sky-400' : 'border-orange-400'}`}>
                  <img 
                    src={emp.photoUrl} 
                    alt={emp.name} 
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div className={`absolute bottom-0 right-0 p-1 rounded-full border-2 border-white ${status.available ? 'bg-green-500' : 'bg-red-500'}`}>
                    {status.available ? <CheckCircle2 size={12} className="text-white" /> : <XCircle size={12} className="text-white" />}
                  </div>
                </div>
                
                <h3 className="mt-4 font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{emp.name}</h3>
                <p className="text-xs text-slate-500 font-medium">{emp.employeeId}</p>
                
                <div className="mt-4 w-full grid grid-cols-2 gap-2 border-t border-slate-50 pt-4">
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Total</p>
                    <p className="text-sm font-bold text-slate-700">{emp.totalDutiesCount}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">This Month</p>
                    <p className="text-sm font-bold text-indigo-600">{monthlyCount}</p>
                  </div>
                </div>

                <div className={`mt-4 w-full py-2 px-3 rounded-lg text-center text-xs font-bold transition-colors ${status.available ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {status.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Search size={48} className="mb-4 opacity-20" />
          <p className="text-lg font-medium">No employees found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
