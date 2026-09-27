import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Terminal, Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import Input from '../components/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';

export default function Login() {
  const [email, setEmail] = useState('alex.chen@example.com');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState('participant');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || (role === 'organizer' ? '/organizer' : '/dashboard');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please enter email and password.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      login(email, password, role);
      setLoading(false);
      success(`Logged in successfully as ${role}!`);
      navigate(from, { replace: true });
    }, 600);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 items-center justify-center text-indigo-400">
            <Terminal className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back to DOGFOOD</h2>
          <p className="text-xs text-slate-400">Sign in to manage your teams, submissions, and hackathons</p>
        </div>

        <Card className="border-indigo-500/20">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection Switch */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-300">Select Login Role</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setRole('participant')}
                    className={`py-1.5 rounded-md font-medium transition-colors ${
                      role === 'participant' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Hacker / Participant
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('organizer')}
                    className={`py-1.5 rounded-md font-medium transition-colors ${
                      role === 'organizer' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Hackathon Organizer
                  </button>
                </div>
              </div>

              <Input
                label="Email Address"
                type="email"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />

              <Input
                label="Password"
                type="password"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />

              <Button variant="primary" className="w-full" isLoading={loading} icon={LogIn}>
                Sign In
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
