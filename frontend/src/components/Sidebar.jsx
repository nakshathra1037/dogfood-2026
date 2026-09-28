import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderGit2,
  Users,
  Award,
  User,
  PlusCircle,
  FileCheck2,
  Settings,
  X,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Badge from './Badge';

const userNavItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Explore Hackathons', path: '/hackathons', icon: Sparkles },
  { name: 'My Hackathons', path: '/dashboard/hackathons', icon: FolderGit2 },
  { name: 'My Team', path: '/dashboard/teams', icon: Users },
  { name: 'My Projects', path: '/dashboard/submissions', icon: Award },
  { name: 'Profile', path: '/dashboard/profile', icon: User },
];

const adminNavItems = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Explore Hackathons', path: '/admin/hackathons', icon: FolderGit2 },
  { name: 'Create Hackathon', path: '/admin/hackathons/create', icon: PlusCircle },
  { name: 'Registrations', path: '/admin/registrations', icon: FileCheck2 },
  { name: 'Participants', path: '/admin/participants', icon: Users },
  { name: 'Teams', path: '/admin/teams', icon: Users },
  { name: 'Settings / Profile', path: '/admin/profile', icon: Settings },
];

export default function Sidebar({ isOpen, onClose, type }) {
  const { user, isOrganizer, isAdmin: isUserAdmin } = useAuth();
  const userRole = (user?.role || '').toUpperCase();
  const isAuthAdmin = userRole === 'ADMIN' || userRole === 'ORGANIZER' || isOrganizer || isUserAdmin;
  const isAdmin = type ? (type === 'admin' || type === 'organizer') : isAuthAdmin;
  const items = isAdmin ? adminNavItems : userNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 glass-panel border-r border-slate-800/80 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Mobile Close Button */}
          <div className="flex items-center justify-between pb-2 lg:hidden border-b border-slate-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {isAdmin ? 'Admin Menu' : 'Hacker Menu'}
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div>
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {isAdmin ? 'ADMIN NAVIGATION' : 'PARTICIPANT NAVIGATION'}
              </span>
              {isAdmin ? (
                <Badge variant="purple" className="text-[9px]">
                  {userRole === 'ADMIN' ? 'ADMIN' : 'ORGANIZER'}
                </Badge>
              ) : (
                <Badge variant="blue" className="text-[9px]">
                  PARTICIPANT
                </Badge>
              )}
            </div>
            <nav className="space-y-1">
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    end={item.path === '/dashboard' || item.path === '/admin' || item.path === '/organizer'}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                        isActive
                          ? isAdmin
                            ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-sm'
                            : 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isActive
                              ? isAdmin
                                ? 'text-purple-400'
                                : 'text-indigo-400'
                              : 'text-slate-500 group-hover:text-slate-300'
                          }`}
                        />
                        <span>{item.name}</span>
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-400 font-mono flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            Database Connected
          </span>
          <span className="text-[10px] text-slate-500">{user?.role || 'GUEST'}</span>
        </div>
      </aside>
    </>
  );
}
