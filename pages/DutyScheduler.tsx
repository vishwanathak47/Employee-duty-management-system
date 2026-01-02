
import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { ShiftTime } from '../types';
import { Calendar, Clock, CheckCircle, AlertCircle, PlusCircle } from 'lucide-react';
import { formatToIST } from '../utils/ist';

const DutyScheduler: React.FC = () => {
  const { state, scheduleDuty, completeDuty, fetchDutiesByDate } = useStore();
  const [selectedDate, setSelectedDate] = useState(formatToIST(new Date()));
  const [selectedEmp, setSelectedEmp] = useState('');
  const [selectedShift, setSelectedShift] = useState(ShiftTime.GENERAL);
  const [isLeave, setIsLeave] = useState(false);

  useEffect(() => {
    fetchDutiesByDate(selectedDate);
  }, [fetchDutiesByDate, selectedDate]);

  const pendingDuties = state.duties.filter(d => !d.isCompleted && d.isScheduled);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;

    const existingForDay = state.duties.filter(d => 
      (d.employeeId === selectedEmp || (d as any).employee === selectedEmp) && 
      d.date === selectedDate
    );

    // Rule: Cannot have 2 duties for the SAME shift
    const sameShift = existingForDay.find(d => d.shiftTime === selectedShift);
    if (sameShift) {
      alert(`Staff already has an entry for the ${selectedShift} slot on this date.`);
      return;
    }

    // Rule: Max 2 shifts total per day
    if (existingForDay.length >= 2 && !isLeave) {
      alert("Employee limit reached: Max 2 distinct shifts per person per day.");
      return;
    }

    try {
      await scheduleDuty({
        employeeId: selectedEmp,
        date: selectedDate,
        shiftTime: selectedShift,
        isScheduled: !isLeave
      });

      alert(isLeave ? "Unavailability marked." : "Duty scheduled.");
      setSelectedEmp('');
    } catch (err) {
      alert('Failed to schedule duty');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-32 sm:pb-8">
      {/* Scheduling Panel */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <PlusCircle size={24} />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Schedule Duty</h2>
          </div>

          <form onSubmit={handleSchedule} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Staff Member</label>
              <select 
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                value={selectedEmp}
                onChange={e => setSelectedEmp(e.target.value)}
              >
                <option value="">Choose Staff...</option>
                {state.employees.map(emp => {
                   const id = emp.id || (emp as any)._id;
                   return <option key={id} value={id}>{emp.name} ({emp.employeeId})</option>
                })}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Date</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Shift Type</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50 dark:text-white"
                  value={selectedShift}
                  onChange={e => setSelectedShift(e.target.value as ShiftTime)}
                >
                  {Object.values(ShiftTime).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 py-2 bg-rose-50 dark:bg-rose-900/10 px-4 rounded-xl border border-rose-100 dark:border-rose-900/50">
              <input 
                type="checkbox" 
                id="leave" 
                className="w-5 h-5 accent-red-600 rounded-md"
                checked={isLeave}
                onChange={e => setIsLeave(e.target.checked)}
              />
              <label htmlFor="leave" className="text-sm font-bold text-red-600 dark:text-red-400 cursor-pointer select-none">
                Mark Unavailable for this slot
              </label>
            </div>

            <button type="submit" className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 dark:shadow-none active:scale-95">
              Lock Schedule
            </button>
          </form>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 flex gap-4">
          <AlertCircle className="text-amber-500 flex-shrink-0" />
          <p className="text-xs text-amber-800 dark:text-amber-200 font-medium">
            <strong>System Control:</strong> A person cannot work the same shift twice. Max 2 separate shifts per day allowed.
          </p>
        </div>
      </div>

      {/* Completion Panel */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-[500px] sm:h-[600px] overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <CheckCircle size={24} />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Mark Completed</h2>
            </div>
            <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-full text-xs font-black">
              {pendingDuties.length} Pending
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
            {pendingDuties.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Calendar size={48} className="mb-4 opacity-10" />
                <p className="font-bold">No tasks awaiting completion</p>
              </div>
            ) : (
              pendingDuties.map(duty => {
                const dutyId = duty.id || (duty as any)._id;
                const empId = duty.employeeId || (duty as any).employee;
                const emp = state.employees.find(e => (e.id === empId || (e as any)._id === empId));
                return (
                  <div key={dutyId} className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between group hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all">
                    <div className="flex items-center gap-4">
                      <img src={emp?.photoUrl} className="w-12 h-12 rounded-xl object-cover shadow-sm border border-white dark:border-slate-700" alt="" />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{emp?.name}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                          <Clock size={12} className="text-indigo-500" />
                          {duty.shiftTime} • {duty.date}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => completeDuty(dutyId)}
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-xl text-xs font-black transition-all shadow-sm active:scale-90"
                    >
                      Done
                    </button>
                  </div>
                );
              })
            )}
            {/* Fix for mobile scroll visibility & missing bottom border */}
            <div className="h-20 sm:hidden"></div>
          </div>
          <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End of Daily Registry</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DutyScheduler;
