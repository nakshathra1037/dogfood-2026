import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Terminal, Menu, X, User, LogOut, LayoutDashboard, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import Badge from './Badge';

export default function Navbar() {
  const { user, isAuthenticated, logout, switchRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 h-16 glass-nav flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-slate-800/80">
      {/* Brand & Logo */}
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-emerald-500 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Terminal className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-indigo-300 text-lg tracking-tight">
                DOGFOOD
              </span>
              <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-indigo-950/80 text-indigo-400 border border-indigo-800/50 font-semibold">
                2026
              </span>
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink
            to="/hackathons"
            className={({ isActive }) =>
              `px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`
            }
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Explore Hackathons
          </NavLink>

          {isAuthenticated && (
            <NavLink
              to={user?.role === 'ORGANIZER' || user?.role === 'ADMIN' ? '/organizer' : '/dashboard'}
              className={({ isActive }) =>
                `px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`
              }
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-purple-400" />
              Dashboard
            </NavLink>
          )}
        </nav>
      </div>

      {/* Right User Actions */}
      <div className="hidden md:flex items-center gap-3">
        {isAuthenticated && user ? (
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center gap-1.5">
              <span className="text-slate-400">Signed in as </span>
              <span className="font-semibold text-white">{user.name || user.email}</span>
              <Badge
                variant={
                  (user.role || '').toUpperCase() === 'ADMIN'
                    ? 'purple'
                    : (user.role || '').toUpperCase() === 'ORGANIZER'
                    ? 'purple'
                    : 'blue'
                }
                className="text-[9px] font-mono uppercase ml-1"
              >
                {(user.role || 'PARTICIPANT').toUpperCase()}
              </Badge>
            </div>

            <Button
              variant="ghost"
              size="sm"
              icon={LogOut}
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="text-slate-400 hover:text-rose-300"
            >
              Logout
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
              Log In
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
              Sign Up
            </Button>
          </div>
        )}
      </div>

      {/* Mobile Menu Trigger */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden"
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-slate-950 border-b border-slate-800 p-4 space-y-3 md:hidden z-50">
          <Link
            to="/hackathons"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm text-slate-300 hover:bg-slate-900 rounded-lg"
          >
            Explore Hackathons
          </Link>

          {isAuthenticated ? (
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate(user.role === 'ORGANIZER' || user.role === 'ADMIN' ? '/organizer' : '/dashboard');
                }}
              >
                Go to Dashboard
              </Button>
              <Button
                variant="outline"
                className="w-full text-rose-400"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  navigate('/login');
                }}
              >
                Log Out
              </Button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/login');
                }}
              >
                Log In
              </Button>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/register');
                }}
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
