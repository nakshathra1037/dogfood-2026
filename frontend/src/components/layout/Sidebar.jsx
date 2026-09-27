import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderGit2,
  Award,
  Sliders,
  Settings,
  X,
  Database,
  Cpu,
  ShieldAlert,
} from 'lucide-react';
import Badge from '../common/Badge';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Submissions', path: '/submissions', icon: FolderGit2, badge: '12' },
  { name: 'Judging Portal', path: '/judging', icon: Award, badge: 'Active' },
  { name: 'Evaluation Criteria', path: '/criteria', icon: Sliders },
  { name: 'Event Settings', path: '/settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
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
        {/* Top Navigation List */}
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Mobile Close Button */}
          <div className="flex items-center justify-between pb-2 lg:hidden border-b border-slate-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Navigation Menu
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div>
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Main Menu
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                        isActive
                          ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-3">
                          <Icon
                            className={`w-4 h-4 transition-colors ${
                              isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
                            }`}
                          />
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <Badge
                            variant={item.badge === 'Active' ? 'indigo' : 'neutral'}
                            className="!px-2 !py-0 text-[10px]"
                          >
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

          {/* Local Host Status Box */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                PostgreSQL Engine
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            </div>
            <div className="text-[11px] text-slate-400 space-y-1 font-mono">
              <div className="flex justify-between">
                <span>Database:</span>
                <span className="text-slate-200">dogfood_db</span>
              </div>
              <div className="flex justify-between">
                <span>FastAPI:</span>
                <span className="text-emerald-400">v0.1.0 Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              Local-First Edition
            </span>
            <span className="text-slate-400">v0.1.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}
