import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderGit2,
  Users,
  Award,
  Bell,
  User,
  PlusCircle,
  Sliders,
  BarChart3,
  X,
  Shield,
} from 'lucide-react';
import Badge from './Badge';

const userNavItems = [
  { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { name: 'My Hackathons', path: '/dashboard/hackathons', icon: FolderGit2, badge: '2' },
  { name: 'My Teams', path: '/dashboard/teams', icon: Users, badge: '1' },
  { name: 'My Submissions', path: '/dashboard/submissions', icon: Award, badge: '1' },
  { name: 'Notifications', path: '/dashboard/notifications', icon: Bell, badge: '3' },
  { name: 'Profile', path: '/dashboard/profile', icon: User },
];

const organizerNavItems = [
  { name: 'Organizer Overview', path: '/organizer', icon: LayoutDashboard },
  { name: 'Create Hackathon', path: '/organizer/create-hackathon', icon: PlusCircle },
  { name: 'Manage Hackathons', path: '/organizer/hackathons', icon: FolderGit2, badge: '3' },
  { name: 'Manage Participants', path: '/organizer/participants', icon: Users, badge: '340' },
  { name: 'Manage Submissions', path: '/organizer/submissions', icon: Award, badge: '12' },
  { name: 'Evaluations', path: '/organizer/evaluations', icon: Sliders },
  { name: 'Analytics', path: '/organizer/analytics', icon: BarChart3 },
];

export default function Sidebar({ isOpen, onClose, type = 'user' }) {
  const items = type === 'organizer' ? organizerNavItems : userNavItems;

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
              {type === 'organizer' ? 'Organizer Console' : 'Hacker Menu'}
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div>
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>{type === 'organizer' ? 'Organizer Controls' : 'User Navigation'}</span>
              {type === 'organizer' && (
                <Badge variant="purple" className="text-[9px]">
                  Admin Mode
                </Badge>
              )}
            </p>
            <nav className="space-y-1">
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    end={item.path === '/dashboard' || item.path === '/organizer'}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                        isActive
                          ? type === 'organizer'
                            ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-sm'
                            : 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-3">
                          <Icon
                            className={`w-4 h-4 transition-colors ${
                              isActive
                                ? type === 'organizer'
                                  ? 'text-purple-400'
                                  : 'text-indigo-400'
                                : 'text-slate-500 group-hover:text-slate-300'
                            }`}
                          />
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <Badge variant="neutral" className="!px-2 !py-0 text-[10px]">
                            {item.badge}
                          </Badge>
                        )}
                      </>
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
            Local Docker API
          </span>
          <span>v0.1.0</span>
        </div>
      </aside>
    </>
  );
}
