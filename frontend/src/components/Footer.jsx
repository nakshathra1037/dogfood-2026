import React from 'react';
import { Terminal, Github, Twitter, Linkedin, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Terminal className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-base tracking-tight">DOGFOOD 2026</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Open-source, local-first hackathon submission and judging platform designed for modern tech competitions.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">Platform</h4>
            <ul className="space-y-2">
              <li><a href="/hackathons" className="hover:text-white transition-colors">Explore Hackathons</a></li>
              <li><a href="/register" className="hover:text-white transition-colors">Register Team</a></li>
              <li><a href="/login" className="hover:text-white transition-colors">Judge Portal</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">Resources</h4>
            <ul className="space-y-2">
              <li><a href="/#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="/#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub Repository</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">Open Source</h4>
            <p className="text-slate-400 text-xs mb-3">
              100% Local execution with zero cloud dependencies. Built with React, Vite, FastAPI, and Docker.
            </p>
            <div className="flex items-center gap-3 text-slate-400">
              <Github className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
              <Twitter className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
              <Linkedin className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <span>&copy; 2026 DOGFOOD Open Source Foundation. All rights reserved.</span>
          <span className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> for Hackathons worldwide.
          </span>
        </div>
      </div>
    </footer>
  );
}
