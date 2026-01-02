
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

  // Monthly count already only includes completed duties from the database logic
  const totalMonthlyCompletedDuties = reportData.reduce((acc, curr) => acc + curr.monthCount, 0);

  return (
    <div className="space-y-6 pb-24 sm:pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Intelligence Reports</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Monthly performance analytics and data exports</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500" size={18} />
            <input 
              type="month" 
              className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm font-bold text-slate-700 dark:text-slate-200 transition-colors"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
            />
          </div>
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-100 dark:shadow-none active:scale-95"
          >
            <Download size={20} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-xl shadow-indigo-100 dark:shadow-none">
          <TrendingUp className="opacity-40 mb-3" size={32} />
          <p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest">Total Monthly Completed</p>
          <p className="text-4xl font-black mt-1">{totalMonthlyCompletedDuties}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
          <Calendar className="text-indigo-600 dark:text-indigo-400 mb-3" size={32} />
          <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">Reporting Period</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{format(new Date(selectedMonth), 'MMMM yyyy')}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hidden lg:block transition-colors">
          <FileSpreadsheet className="text-emerald-600 dark:text-emerald-400 mb-3" size={32} />
          <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">Staff Registry</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{reportData.length} Personnel</p>
        </div>
      </div>

      {/* Performance Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-800 sticky left-0 z-10">
          <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter">Performance Breakdown</h3>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500">
            <AlertCircle size={14} />
            <span>Completed Duties Only</span>
          </div>
        </div>
        
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Staff Member</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee ID</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Month Count</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Lifetime Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {reportData.map((row, idx) => (
                <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-300 dark:text-slate-600 w-4">{idx + 1}</span>
                      <span className="font-bold text-slate-900 dark:text-slate-200 tracking-tight">{row.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 font-mono font-medium">{row.id}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center justify-center min-w-[2.5rem] px-3 py-1 rounded-full text-xs font-black ${row.monthCount > 0 ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      {row.monthCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-black text-slate-700 dark:text-slate-300">{row.totalCount}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="h-px bg-slate-200 dark:bg-slate-700 w-full"></div>
      </div>
    </div>
  );
};

export default Reports;
