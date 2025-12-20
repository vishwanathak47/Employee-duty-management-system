
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

  // Fix: Refresh duties list whenever the date selection changes
  useEffect(() => {
    fetchDutiesByDate(selectedDate);
  }, [fetchDutiesByDate, selectedDate]);

  const pendingDuties = state.duties.filter(d => !d.isCompleted && d.isScheduled);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;

    // Check for double shift limitation (max 2 per day)
    const existingForDay = state.duties.filter(d => (d.employeeId === selectedEmp || (d as any).employee === selectedEmp) && d.date === selectedDate);
    if (existingForDay.length >= 2 && !isLeave) {
      alert("Employee already has 2 shifts scheduled for this day.");
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Scheduling Panel */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <PlusCircle size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Schedule New Duty</h2>
          </div>

          <form onSubmit={handleSchedule} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Select Employee</label>
              <select 
                required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
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
                <label className="block text-sm font-bold text-slate-700 mb-1">Date</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Shift Type</label>
                <select 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
                  value={selectedShift}
                  disabled={isLeave}
                  onChange={e => setSelectedShift(e.target.value as ShiftTime)}
                >
                  {Object.values(ShiftTime).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 py-2">
              <input 
                type="checkbox" 
                id="leave" 
                className="w-5 h-5 accent-red-600"
                checked={isLeave}
                onChange={e => setIsLeave(e.target.checked)}
              />
              <label htmlFor="leave" className="text-sm font-bold text-red-600 cursor-pointer">
                Mark as Unavailability / Leave for this slot
              </label>
            </div>

            <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-md active:scale-95">
              Confirm Schedule
            </button>
          </form>
        </div>

        {/* Info Box */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-4">
          <AlertCircle className="text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <strong>System Rule:</strong> Max 2 distinct shifts per employee per day. Marking unavailability will block scheduling for that specific time slot.
          </p>
        </div>
      </div>

      {/* Completion Panel */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full max-h-[600px]">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <CheckCircle size={24} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Mark Completed</h2>
            </div>
            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
              {pendingDuties.length} Pending
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {pendingDuties.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Calendar size={48} className="mb-4 opacity-20" />
                <p>No active schedules to complete</p>
              </div>
            ) : (
              pendingDuties.map(duty => {
                const dutyId = duty.id || (duty as any)._id;
                const empId = duty.employeeId || (duty as any).employee;
                const emp = state.employees.find(e => (e.id === empId || (e as any)._id === empId));
                return (
                  <div key={dutyId} className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <img src={emp?.photoUrl} className="w-10 h-10 rounded-full" alt="" />
                      <div>
                        <p className="font-bold text-slate-900">{emp?.name}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Clock size={12} />
                          {duty.shiftTime} • {duty.date}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => completeDuty(dutyId)}
                      className="bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm"
                    >
                      Complete
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DutyScheduler;
