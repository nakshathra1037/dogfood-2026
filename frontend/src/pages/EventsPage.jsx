import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { Calendar, Trophy, Layers, ArrowRight, Clock } from 'lucide-react';

export function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/events?limit=50');
      setEvents(res.data.items || []);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const statusVariants = {
    ACTIVE: 'success',
    DRAFT: 'warning',
    ENDED: 'default',
    ARCHIVED: 'danger',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Hackathon Events
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Explore ongoing competitions, tracks, prizes, and historical leaderboards.
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading hackathons..." />
      ) : events.length === 0 ? (
        <EmptyState
          title="No events found"
          description="There are currently no published hackathon events."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="flex flex-col justify-between rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 hover:border-slate-700 transition shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant={statusVariants[ev.status] || 'default'}>
                    {ev.status}
                  </Badge>
                  <div className="flex items-center space-x-1 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{formatDate(ev.end_date)}</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">
                  {ev.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                  {ev.description || 'No description provided.'}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3 text-xs text-slate-400">
                  <div className="flex items-center space-x-1">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    <span>Tracks</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Trophy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Prizes</span>
                  </div>
                </div>

                <Link
                  to={`/events/${ev.id}`}
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
                >
                  <span>Event Hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
