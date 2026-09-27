import React, { useState } from 'react';
import { Settings, Server, RefreshCw, CheckCircle2, XCircle, Database, ShieldCheck, Download } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Input from '../components/common/Input';
import apiClient from '../api/client';

export default function SettingsPage() {
  const [eventName, setEventName] = useState('DOGFOOD 2026 Hackathon');
  const [backendStatus, setBackendStatus] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  const testBackendConnection = async () => {
    setIsTesting(true);
    try {
      const response = await apiClient.get('/health');
      setBackendStatus({ success: true, data: response.data });
    } catch (err) {
      setBackendStatus({
        success: false,
        message: err.message || 'Could not connect to local FastAPI backend on port 8000',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-7 h-7 text-indigo-400" />
          Event & System Settings
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage local platform configurations, inspect backend connectivity, and export data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Event General Settings */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Event Details</CardTitle>
              <CardDescription>Configure hackathon title and local display settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Hackathon Name"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
              />
              <Input label="Local Host Port" value="5173" disabled />
              <Input label="Backend Host API URL" value="http://localhost:8000" disabled />
            </CardContent>
            <CardFooter className="justify-end">
              <Button variant="emerald">Save Settings</Button>
            </CardFooter>
          </Card>

          {/* System Connection Diagnostic Card */}
          <Card>
            <CardHeader>
              <CardTitle icon={Server}>Local Backend Diagnostic</CardTitle>
              <CardDescription>Test Axios connection to Python FastAPI backend endpoint (/health)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-sm font-semibold text-slate-200">FastAPI Service Connection</span>
                  <p className="text-xs text-slate-400">Endpoint: http://localhost:8000/health</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={RefreshCw}
                  isLoading={isTesting}
                  onClick={testBackendConnection}
                >
                  Test Endpoint
                </Button>
              </div>

              {backendStatus && (
                <div
                  className={`p-4 rounded-xl border text-xs ${
                    backendStatus.success
                      ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/60 border-rose-800 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold">
                    {backendStatus.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                    <span>{backendStatus.success ? 'Backend Connection Successful!' : 'Connection Error'}</span>
                  </div>
                  <pre className="mt-2 p-2 bg-slate-950/80 rounded font-mono text-[11px] overflow-x-auto text-slate-300">
                    {backendStatus.success
                      ? JSON.stringify(backendStatus.data, null, 2)
                      : backendStatus.message}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Database & Data Export */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle icon={Database}>Database Persistence</CardTitle>
              <CardDescription>PostgreSQL container status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Database Name:</span>
                <span className="font-mono text-slate-200 font-medium">dogfood_db</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Container Image:</span>
                <span className="font-mono text-slate-200 font-medium">postgres:16-alpine</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Persistence Volume:</span>
                <span className="font-mono text-slate-200 font-medium">postgres_data</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle icon={Download}>Local Data Backup</CardTitle>
              <CardDescription>Export submissions & judging scores as JSON</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" icon={Download} className="w-full">
                Export JSON Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
