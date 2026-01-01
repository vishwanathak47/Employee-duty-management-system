
import React, { useState, useRef } from 'react';
import { useStore } from '../store';
import { Gender } from '../types';
import { UserPlus, Edit2, Trash2, X, Save, Camera, UploadCloud, Image as ImageIcon } from 'lucide-react';

const EmployeeManagement: React.FC = () => {
  const { state, addEmployee, updateEmployee, deleteEmployee } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    gender: Gender.MALE,
    address: '',
    photoUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=200&fit=crop'
  });

  const resetForm = () => {
    setFormData({
      name: '',
      employeeId: '',
      gender: Gender.MALE,
      address: '',
      photoUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=200&fit=crop'
    });
    setEditingEmp(null);
  };

  const handleOpenModal = (emp?: any) => {
    if (emp) {
      setFormData({
        name: emp.name,
        employeeId: emp.employeeId,
        gender: emp.gender,
        address: emp.address,
        photoUrl: emp.photoUrl
      });
      setEditingEmp(emp.id || emp._id);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File too large. Please select an image under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmp) {
      updateEmployee(editingEmp, formData);
    } else {
      addEmployee(formData);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('PERMANENT ACTION: Terminate this employee profile? All historical duty logs will be wiped.')) {
      deleteEmployee(id);
    }
  };

  return (
    <div className="space-y-6 pb-24 sm:pb-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Staff Directory</h1>
          <p className="text-slate-500 font-medium">Registry of active site personnel</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-100 active:scale-[0.97]"
        >
          <UserPlus size={20} />
          <span>Onboard New Staff</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Personnel Info</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee ID</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Gender</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hidden md:table-cell">Location</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.employees.map(emp => (
                <tr key={emp.id || (emp as any)._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img src={emp.photoUrl} alt="" className="w-12 h-12 rounded-2xl border border-slate-200 object-cover shadow-sm" />
                        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${emp.gender === Gender.FEMALE ? 'bg-sky-400' : 'bg-orange-400'}`}></div>
                      </div>
                      <div className="font-black text-slate-900 tracking-tight">{emp.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-500 tracking-wider font-mono text-sm">{emp.employeeId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${emp.gender === Gender.FEMALE ? 'bg-sky-100 text-sky-700' : 'bg-orange-100 text-orange-700'}`}>
                      {emp.gender}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium hidden md:table-cell truncate max-w-xs">{emp.address || 'No address registered'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => handleOpenModal(emp)} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit2 size={18} /></button>
                      <button onClick={() => handleDelete(emp.id || (emp as any)._id)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 flex justify-between items-center border-b border-slate-100">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{editingEmp ? 'Update Profile' : 'Staff Onboarding'}</h2>
                <p className="text-sm text-slate-500 font-medium">Configure employee identity and access</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-full transition-colors"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Photo Upload Section */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                   <div className="w-32 h-32 rounded-[2rem] overflow-hidden border-4 border-slate-100 shadow-xl group-hover:border-indigo-200 transition-all">
                      <img src={formData.photoUrl} className="w-full h-full object-cover" alt="Preview" />
                   </div>
                   <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-3 rounded-2xl shadow-lg hover:bg-indigo-700 transition-all hover:scale-110 active:scale-90"
                   >
                     <Camera size={20} />
                   </button>
                   <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/*"
                   />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Employee Identity Photo</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Employee ID</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. DS-2025-01"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 font-mono"
                    value={formData.employeeId}
                    onChange={e => setFormData({...formData, employeeId: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Gender Specification</label>
                <div className="flex gap-4">
                  {[Gender.MALE, Gender.FEMALE].map(g => (
                    <label key={g} className={`flex-1 flex items-center justify-center gap-3 py-3.5 border-2 rounded-2xl cursor-pointer transition-all font-bold ${formData.gender === g ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}>
                      <input 
                        type="radio" 
                        name="gender" 
                        className="hidden"
                        checked={formData.gender === g}
                        onChange={() => setFormData({...formData, gender: g})}
                      />
                      <span>{g}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Residential Data</label>
                <textarea 
                  placeholder="Permanent address details..."
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none font-medium text-slate-600"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                ></textarea>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all active:scale-[0.98]"
                >
                  Discard
                </button>
                <button 
                  type="submit" 
                  className="flex-[2] bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  {editingEmp ? 'Commit Updates' : 'Authorize Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
