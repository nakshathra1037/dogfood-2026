import React, { useState } from 'react';
import { Bell, CheckCircle2, Info, AlertTriangle, Check } from 'lucide-react';
import { mockNotifications } from '../data/mockNotifications';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';

export default function Notifications() {
  const [list, setList] = useState(mockNotifications);

  const markAllRead = () => {
    setList((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-400" />
            Notifications Center
          </h1>
          <p className="text-slate-400 text-xs mt-1">Updates on team invites, submission deadlines, and evaluation alerts.</p>
        </div>

        <Button variant="ghost" size="sm" icon={Check} onClick={markAllRead}>
          Mark All as Read
        </Button>
      </div>

      <Card>
        <CardContent className="p-0 divide-y divide-slate-800">
          {list.map((n) => (
            <div
              key={n.id}
              className={`p-4 flex items-start gap-4 transition-colors ${
                n.read ? 'bg-slate-900/40 opacity-75' : 'bg-slate-900/90'
              }`}
            >
              {n.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
              {n.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
              {n.type === 'info' && <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />}

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-200">{n.title}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
