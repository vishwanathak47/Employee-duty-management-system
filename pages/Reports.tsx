
import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { Download, FileSpreadsheet, TrendingUp, Calendar } from 'lucide-react';
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
    }));
  }, [state.employees, selectedMonth]);

  const handleDownload = () => {
    const monthYear = format(new Date(selectedMonth), 'MMMM yyyy');
    const headers = ['Employee Name', 'Employee ID', 'Gender', `Duties (${monthYear})`, 'Total Duties'];
    const csvContent = [
      headers.join(','),
      ...reportData.map(row => `${row.name},${row.id},${row.gender},${row.monthCount},${row.totalCount}`)
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Duty Reports</h1>
          <p className="text-slate-500 text-sm">Review performance metrics and exports</p>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="month" 
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
          />
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-sm"
          >
            <Download size={20} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100">
          <TrendingUp className="opacity-40 mb-2" size={32} />
          <p className="text-indigo-100 text-sm font-medium">Total Monthly Shifts</p>
          <p className="text-4xl font-bold mt-1">{totalMonthlyDuties}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <Calendar className="text-indigo-600 mb-2" size={32} />
          <p className="text-slate-500 text-sm font-medium">Reporting Month</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{format(new Date(selectedMonth), 'MMMM yyyy')}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <FileSpreadsheet className="text-emerald-600 mb-2" size={32} />
          <p className="text-slate-500 text-sm font-medium">Total Staff Tracked</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{reportData.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Performance Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Staff Member</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Employee ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Selected Month</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Cumulative Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportData.map(row => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{row.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{row.id}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">
                      {row.monthCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-slate-700">{row.totalCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
