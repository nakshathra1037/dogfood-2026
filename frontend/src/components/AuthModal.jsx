import React, { useState } from 'react';
import { Modal } from './Modal';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { Loader2, KeyRound, UserPlus, Sparkles } from 'lucide-react';

export function AuthModal({ isOpen, onClose }) {
  const { login } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('PARTICIPANT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const demoAccounts = [
    { label: 'Organizer', email: 'organizer@dogfood.local', pass: 'Organizer1234!', role: 'ORGANIZER', color: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10' },
    { label: 'Judge 1', email: 'judge1@dogfood.local', pass: 'Judge1234!', role: 'JUDGE', color: 'border-purple-500/30 text-purple-400 bg-purple-500/10' },
    { label: 'Judge 2', email: 'judge2@dogfood.local', pass: 'Judge1234!', role: 'JUDGE', color: 'border-purple-500/30 text-purple-400 bg-purple-500/10' },
    { label: 'Participant (Alice)', email: 'alice@dogfood.local', pass: 'Participant1234!', role: 'PARTICIPANT', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' },
    { label: 'Admin', email: 'admin@dogfood.local', pass: 'Admin1234!', role: 'ADMIN', color: 'border-amber-500/30 text-amber-400 bg-amber-500/10' },
  ];

  const handleQuickLogin = async (demoEmail, demoPass) => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.post('/auth/login', {
        email: demoEmail,
        password: demoPass,
      });
      login(res.data.access_token, res.data.user);
      onClose();
    } catch (err) {
      setError(err.userMessage || 'Failed to authenticate with demo credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (tab === 'login') {
        const res = await apiClient.post('/auth/login', {
          email: email.trim(),
          password,
        });
        login(res.data.access_token, res.data.user);
        onClose();
      } else {
        // Register
        await apiClient.post('/auth/register', {
          name: name.trim(),
          email: email.trim(),
          password,
          role,
        });
        // Auto login after registration
        const loginRes = await apiClient.post('/auth/login', {
          email: email.trim(),
          password,
        });
        login(loginRes.data.access_token, loginRes.data.user);
        onClose();
      }
    } catch (err) {
      setError(err.userMessage || 'Authentication request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={tab === 'login' ? 'Sign In to DOGFOOD' : 'Create an Account'}>
      {/* 1-Click Demo Logins */}
      <div className="mb-6 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>ONE-CLICK DEMO ACCOUNTS</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {demoAccounts.map((acc) => (
            <button
              key={acc.label}
              type="button"
              onClick={() => handleQuickLogin(acc.email, acc.pass)}
              disabled={loading}
              className={`px-3 py-2 text-xs font-medium rounded-lg border text-center transition hover:brightness-125 disabled:opacity-50 ${acc.color}`}
            >
              {acc.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-lg bg-slate-950 p-1 mb-5 border border-slate-800">
        <button
          type="button"
          onClick={() => { setTab('login'); setError(''); }}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${tab === 'login' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setTab('register'); setError(''); }}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${tab === 'register' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
        >
          Register
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {tab === 'register' && (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alice Coder"
              className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
            className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        {tab === 'register' && (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Select Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="PARTICIPANT">Participant (Create/Join Team & Submit)</option>
              <option value="JUDGE">Judge (Evaluate Assigned Projects)</option>
              <option value="ORGANIZER">Organizer (Manage Hackathon & Scoring)</option>
            </select>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 flex items-center justify-center py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : tab === 'login' ? (
            'Sign In'
          ) : (
            'Create Account'
          )}
        </button>
      </form>
    </Modal>
  );
}
