import React, { useState } from 'react';
import { Menu, Bell, Search, Server, Terminal, ShieldCheck, User } from 'lucide-react';
import Badge from '../common/Badge';

export default function Navbar({ onToggleSidebar }) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-30 h-16 glass-nav flex items-center justify-between px-4 sm:px-6">
      {/* Left section: Toggle & Brand */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors lg:hidden"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-emerald-500 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20">
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
            <p className="text-[10px] text-slate-400 hidden sm:block font-mono">
              Local Hackathon Evaluation Platform
            </p>
          </div>
        </div>
      </div>

      {/* Middle section: Global Search Bar */}
      <div className="hidden md:flex items-center max-w-xs w-full">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search projects, criteria, judges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-900/80 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Right section: System Status & User Actions */}
      <div className="flex items-center gap-3">
        {/* Local Docker Indicator */}
        <Badge variant="emerald" pulse className="hidden sm:inline-flex py-1 px-3">
          <Server className="w-3.5 h-3.5 mr-1" />
          <span>Docker Local Mode</span>
        </Badge>

        {/* Notifications Mock Button */}
        <button
          className="relative p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 rounded-lg transition-colors"
          aria-label="View Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-slate-950"></span>
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>

        {/* User Profile Badge */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-semibold text-xs">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-slate-200">Local Judge / Host</div>
            <div className="text-[10px] text-slate-400 font-mono">admin@local</div>
          </div>
        </div>
      </div>
    </header>
  );
}
