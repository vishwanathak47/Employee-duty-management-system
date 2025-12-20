
import React, { useState } from 'react';
import { useStore } from '../store';
import { Gender } from '../types';
import { UserPlus, Edit2, Trash2, X, Save } from 'lucide-react';

const EmployeeManagement: React.FC = () => {
  const { state, addEmployee, updateEmployee, deleteEmployee } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    gender: Gender.MALE,
    address: '',
    photoUrl: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      employeeId: '',
      gender: Gender.MALE,
      address: '',
      photoUrl: ''
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
      setEditingEmp(emp.id);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
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
    if (window.confirm('Are you sure you want to terminate this employee profile? All history will be deleted.')) {
      deleteEmployee(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Staff Management</h1>
          <p className="text-slate-500 text-sm">Manage your team profiles and details</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-sm active:scale-95"
        >
          <UserPlus size={20} />
          <span className="hidden sm:inline">Add Employee</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Staff Info</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Gender</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Address</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.employees.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img src={emp.photoUrl} alt="" className="w-10 h-10 rounded-full border border-slate-200" />
                      <div className="font-medium text-slate-900">{emp.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{emp.employeeId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${emp.gender === Gender.FEMALE ? 'bg-sky-100 text-sky-700' : 'bg-orange-100 text-orange-700'}`}>
                      {emp.gender}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{emp.address}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenModal(emp)} className="p-2 text-slate-400 hover:text-indigo-600"><Edit2 size={18} /></button>
                      <button onClick={() => handleDelete(emp.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 flex justify-between items-center border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">{editingEmp ? 'Edit Profile' : 'New Registration'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Employee ID</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.employeeId}
                  onChange={e => setFormData({...formData, employeeId: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Gender</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="gender" 
                      checked={formData.gender === Gender.MALE}
                      onChange={() => setFormData({...formData, gender: Gender.MALE})}
                    />
                    <span className="text-sm">Male</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="gender" 
                      checked={formData.gender === Gender.FEMALE}
                      onChange={() => setFormData({...formData, gender: Gender.FEMALE})}
                    />
                    <span className="text-sm">Female</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Photo URL</label>
                <input 
                  type="url" 
                  placeholder="https://example.com/photo.jpg"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.photoUrl}
                  onChange={e => setFormData({...formData, photoUrl: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Residential Address</label>
                <textarea 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-20 resize-none"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                ></textarea>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2">
                  <Save size={20} />
                  {editingEmp ? 'Update Profile' : 'Register Employee'}
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
