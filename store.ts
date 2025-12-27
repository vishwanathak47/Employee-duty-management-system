
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Employee, Duty, User, AppState } from './types';

/**
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Deploy your backend to Render.
 * 2. Copy the "Live URL" from your Render Dashboard.
 * 3. Replace the placeholder below with your ACTUAL Render URL.
 */
const YOUR_ACTUAL_RENDER_URL = 'https://employee-duty-management-system.onrender.com'; 

const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? '/api' 
  : `${YOUR_ACTUAL_RENDER_URL}/api`;

interface StoreContextType {
  state: AppState;
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  fetchEmployees: () => Promise<void>;
  addEmployee: (emp: any) => Promise<void>;
  updateEmployee: (id: string, updates: any) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  scheduleDuty: (duty: any) => Promise<void>;
  completeDuty: (id: string) => Promise<void>;
  fetchDutiesByDate: (date: string) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const savedUser = localStorage.getItem('user');
    return {
      user: savedUser ? JSON.parse(savedUser) : null,
      employees: [],
      duties: []
    };
  });

  const getToken = () => localStorage.getItem('token');
  
  const getAuthHeaders = useCallback(() => {
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }, []);

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/employees`, { headers: getAuthHeaders() });
      if (res.ok) {
        const employees = await res.json();
        setState(prev => ({ ...prev, employees }));
      }
    } catch (err) {
      console.warn('Backend currently unreachable at:', API_BASE);
    }
  }, [getAuthHeaders]);

  const fetchDutiesByDate = useCallback(async (date: string) => {
    try {
      const res = await fetch(`${API_BASE}/duties/status/${date}`, { headers: getAuthHeaders() });
      if (res.ok) {
        const duties = await res.json();
        setState(prev => ({ ...prev, duties }));
      }
    } catch (err) {
      console.error('Failed to fetch duties', err);
    }
  }, [getAuthHeaders]);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setState(prev => ({ ...prev, user: data.user }));
      return data.user;
    }
    throw new Error(data.message || 'Login failed');
  };

  const signup = async (name: string, email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (res.ok && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setState(prev => ({ ...prev, user: data.user }));
      return data.user;
    }
    throw new Error(data.message || 'Signup failed');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setState({ user: null, employees: [], duties: [] });
  };

  const addEmployee = async (emp: any) => {
    const res = await fetch(`${API_BASE}/employees`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(emp)
    });
    if (res.ok) {
      const newEmp = await res.json();
      setState(prev => ({ ...prev, employees: [...prev.employees, newEmp] }));
    }
  };

  const updateEmployee = async (id: string, updates: any) => {
    const res = await fetch(`${API_BASE}/employees/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    if (res.ok) {
      const updatedEmp = await res.json();
      setState(prev => ({
        ...prev,
        employees: prev.employees.map(e => (e.id === id || (e as any)._id === id) ? updatedEmp : e)
      }));
    }
  };

  const deleteEmployee = async (id: string) => {
    const res = await fetch(`${API_BASE}/employees/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (res.ok) {
      setState(prev => ({
        ...prev,
        employees: prev.employees.filter(e => e.id !== id && (e as any)._id !== id)
      }));
    }
  };

  const scheduleDuty = async (duty: any) => {
    const res = await fetch(`${API_BASE}/duties/schedule`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(duty)
    });
    if (res.ok) {
      const newDuty = await res.json();
      setState(prev => ({ ...prev, duties: [...prev.duties, newDuty] }));
    }
  };

  const completeDuty = async (id: string) => {
    const res = await fetch(`${API_BASE}/duties/complete/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const completedDuty = await res.json();
      setState(prev => ({
        ...prev,
        duties: prev.duties.map(d => (d.id === id || (d as any)._id === id) ? completedDuty : d)
      }));
      fetchEmployees();
    }
  };

  useEffect(() => {
    if (state.user) {
      fetchEmployees();
    }
  }, [state.user, fetchEmployees]);

  return React.createElement(StoreContext.Provider, {
    value: { 
      state, login, signup, logout, 
      fetchEmployees, addEmployee, updateEmployee, 
      deleteEmployee, scheduleDuty, completeDuty, 
      fetchDutiesByDate 
    }
  }, children);
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
