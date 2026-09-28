import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Terminal, Mail, Lock, LogIn, Shield, Users, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import Input from '../components/Input';
import { Card, CardContent } from '../components/Card';
import apiClient from '../api/client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('organizer'); // 'participant' | 'organizer'
  const [loading, setLoading] = useState(false);

  const { user, isAuthenticated, login } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      const userRole = (user.role || '').toUpperCase();
      if (userRole === 'ADMIN' || userRole === 'ORGANIZER') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const fillCredentials = (roleType) => {
    if (roleType === 'admin') {
      setSelectedRole('organizer');
      setEmail('admin@dogfood.local');
      setPassword('Admin1234!');
    } else if (roleType === 'organizer') {
      setSelectedRole('organizer');
      setEmail('organizer@dogfood.local');
      setPassword('Organizer1234!');
    } else {
      setSelectedRole('participant');
      setEmail('alice@dogfood.local');
      setPassword('Participant1234!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toastError('Please enter email and password.');
      return;
    }

    setLoading(true);
    try {
      let res;
      try {
        res = await apiClient.post('/auth/login', {
          email: email.trim(),
          password: password,
        });
      } catch (loginErr) {
        // If account not found in local DB, auto-register with chosen role
        if (loginErr.response?.status === 401 || loginErr.response?.status === 404) {
          try {
            const roleToRegister = selectedRole === 'organizer' ? 'ORGANIZER' : 'PARTICIPANT';
            await apiClient.post('/auth/register', {
              name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'User',
              email: email.trim(),
              password: password,
              role: roleToRegister,
            });
            res = await apiClient.post('/auth/login', {
              email: email.trim(),
              password: password,
            });
          } catch {
            throw loginErr;
          }
        } else {
          throw loginErr;
        }
      }

      const token = res.data.access_token;
      const userObj = res.data.user;
      login(token, userObj);

      const actualRole = (userObj.role || '').toUpperCase();
      success(`Welcome back, ${userObj.name || userObj.email}! Logged in as ${actualRole}.`);

      // STRICT ROLE-BASED REDIRECTION
      if (actualRole === 'ADMIN' || actualRole === 'ORGANIZER') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.detail ||
        err.userMessage ||
        'Login failed. Please check your credentials.';
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10">
            <Terminal className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Sign In to DOGFOOD</h2>
          <p className="text-xs text-slate-400">Select your role to access your dedicated workspace</p>
        </div>

        {/* Quick Demo Credentials */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-[11px]">
            <KeyRound className="w-3.5 h-3.5 text-purple-400" />
            <span>Quick Demo Credentials:</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('admin')}
              className="px-2 py-1.5 rounded-lg bg-purple-950/60 border border-purple-800/60 text-purple-300 hover:bg-purple-900/60 text-[10px] font-mono font-medium transition-colors"
            >
              Admin Demo
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('organizer')}
              className="px-2 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 hover:bg-indigo-900/60 text-[10px] font-mono font-medium transition-colors"
            >
              Organizer Demo
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('participant')}
              className="px-2 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/60 text-[10px] font-mono font-medium transition-colors"
            >
              Hacker Demo
            </button>
          </div>
        </div>

        <Card className="border-indigo-500/20 shadow-2xl">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role Selection Tabs */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Select Login Role <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('organizer');
                      if (email === 'alice@dogfood.local') setEmail('admin@dogfood.local');
                    }}
                    className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                      selectedRole === 'organizer'
                        ? 'bg-purple-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    <span>Organizer / Admin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('participant');
                      if (email === 'admin@dogfood.local') setEmail('alice@dogfood.local');
                    }}
                    className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                      selectedRole === 'participant'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Hacker / Participant</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 pt-0.5">
                  {selectedRole === 'organizer'
                    ? 'Access admin console to create, publish, and manage hackathons.'
                    : 'Access participant workspace, registrations, teams, and submissions.'}
                </p>
              </div>

              <Input
                label="Email Address"
                type="email"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={selectedRole === 'organizer' ? 'admin@dogfood.local' : 'alice@dogfood.local'}
                required
              />

              <Input
                label="Password"
                type="password"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              <Button
                variant={selectedRole === 'organizer' ? 'primary' : 'emerald'}
                className="w-full"
                isLoading={loading}
                icon={LogIn}
                type="submit"
              >
                Sign In as {selectedRole === 'organizer' ? 'Organizer / Admin' : 'Hacker / Participant'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-400 font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
