
import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { Download, FileSpreadsheet, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const Reports: React.FC = () => {
  const { state } = useStore();
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  const reportData = useMemo(() => {
    const monthYear = format(new Date(selectedMonth), 'MMMM yyyy');
    return state.employees.map(emp => ({
      name: emp.name,
      id: emp.employeeId,
      gender: emp.gender,
      monthCount: emp.monthlyDuties.find(m => m.monthYear === monthYear)?.count || 0,
      totalCount: emp.totalDutiesCount
    })).sort((a, b) => b.monthCount - a.monthCount || a.name.localeCompare(b.name));
  }, [state.employees, selectedMonth]);

  const handleDownload = () => {
    const monthYear = format(new Date(selectedMonth), 'MMMM yyyy');
    const headers = ['Employee Name', 'Employee ID', 'Gender', `Duties (${monthYear})`, 'Total Duties'];
    const csvContent = [
      headers.join(','),
      ...reportData.map(row => `"${row.name}","${row.id}","${row.gender}",${row.monthCount},${row.totalCount}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `DutySync_Report_${monthYear.replace(' ', '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalMonthlyDuties = reportData.reduce((acc, curr) => acc + curr.monthCount, 0);

  return (
    <div className="space-y-6 pb-24 sm:pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Intelligence Reports</h1>
          <p className="text-slate-500 font-medium">Monthly performance analytics and data exports</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500" size={18} />
            <input 
              type="month" 
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm font-bold text-slate-700"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
            />
          </div>
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-100 active:scale-95"
          >
            <Download size={20} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-xl shadow-indigo-100">
          <TrendingUp className="opacity-40 mb-3" size={32} />
          <p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest">Total Monthly Shifts</p>
          <p className="text-4xl font-black mt-1">{totalMonthlyDuties}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <Calendar className="text-indigo-600 mb-3" size={32} />
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Reporting Period</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{format(new Date(selectedMonth), 'MMMM yyyy')}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hidden lg:block">
          <FileSpreadsheet className="text-emerald-600 mb-3" size={32} />
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Staff Count</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{reportData.length} Personnel</p>
        </div>
      </div>

      {/* Performance Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky left-0">
          <h3 className="font-black text-slate-900 uppercase tracking-tighter">Performance Breakdown</h3>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
            <AlertCircle size={14} />
            <span>Sorted by highest engagement</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Staff Member</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee ID</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Selected Month</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Cumulative Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportData.map((row, idx) => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-300 w-4">{idx + 1}</span>
                      <span className="font-bold text-slate-900 tracking-tight">{row.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-mono font-medium">{row.id}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center justify-center min-w-[2.5rem] px-3 py-1 rounded-full text-xs font-black ${row.monthCount > 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400'}`}>
                      {row.monthCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-black text-slate-700">{row.totalCount}</span>
                  </td>
                </tr>
              ))}
              {reportData.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-bold">
                    No personnel records available for report generation.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Fix for missing bottom border on some mobile browsers */}
        <div className="h-px bg-slate-200 w-full"></div>
      </div>
      
      {/* Mobile-only scroll hint */}
      <div className="sm:hidden flex items-center justify-center gap-2 text-slate-400 text-[10px] font-bold py-2">
        <span>Scroll table horizontally to view all columns</span>
        <div className="w-8 h-1 bg-slate-200 rounded-full overflow-hidden">
          <div className="w-1/2 h-full bg-indigo-400 animate-[scroll_2s_infinite]"></div>
        </div>
      </div>
      
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};

export default Reports;
