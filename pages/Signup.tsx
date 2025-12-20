
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store';
import { UserPlus } from 'lucide-react';

const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  // Fix: Use signup action instead of login
  const { signup } = useStore();
  const navigate = useNavigate();

  // Fix: Pass name, email, and password to signup
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signup(name, email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-violet-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-violet-200">
            <UserPlus size={36} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Signup</h1>
          <p className="text-slate-500 mt-2 text-center">Create a new supervisor profile</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none transition-all"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
            <input 
              required
              type="email" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none transition-all"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
            <input 
              required
              type="password" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none transition-all"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-violet-600 text-white font-bold py-4 rounded-xl hover:bg-violet-700 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
          >
            Create Account
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Already have an account? <Link to="/login" className="text-violet-600 font-bold hover:underline">Log in here</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
