import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Badge } from './Badge';
import { AuthModal } from './AuthModal';
import {
  Trophy,
  LayoutGrid,
  Calendar,
  Layers,
  Scale,
  LogOut,
  LogIn,
  User as UserIcon,
} from 'lucide-react';

export function Navbar() {
  const { user, logout, isOrganizer, isJudge } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const location = useLocation();

  const roleVariants = {
    ADMIN: 'danger',
    ORGANIZER: 'primary',
    JUDGE: 'purple',
    PARTICIPANT: 'success',
  };

  const navLinks = [
    { label: 'Gallery', path: '/', icon: LayoutGrid },
    { label: 'Events', path: '/events', icon: Calendar },
    { label: 'Participant Hub', path: '/participant', icon: Layers },
    ...(isJudge ? [{ label: 'Judge Dashboard', path: '/judge', icon: Scale }] : []),
    ...(isOrganizer ? [{ label: 'Organizer Portal', path: '/organizer', icon: Trophy }] : []),
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
                ⚡
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white">
                DOGFOOD <span className="text-indigo-400 text-sm font-medium">2026</span>
              </span>
            </Link>

            {/* Navigation links */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      isActive
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-medium text-slate-200">{user.name}</span>
                  <Badge variant={roleVariants[user.role] || 'default'}>
                    {user.role}
                  </Badge>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Demo</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
