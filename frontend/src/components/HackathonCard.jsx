import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Award, ArrowRight, CheckCircle2, Layers, MapPin } from 'lucide-react';
import { Card } from './Card';
import Badge from './Badge';
import Button from './Button';

export default function HackathonCard({ hackathon, isRegistered = false }) {
  const navigate = useNavigate();

  // Normalize fields from backend or client representation
  const name = hackathon.name || hackathon.title || 'Untitled Hackathon';
  const description = hackathon.description || hackathon.tagline || 'Innovative hackathon challenge on DOGFOOD platform.';
  const organizer = hackathon.organizer || (hackathon.created_by ? `Organizer #${hackathon.created_by}` : 'DOGFOOD Organizers');
  
  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBD';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const startDate = formatDate(hackathon.start_date || hackathon.startDate);
  const endDate = formatDate(hackathon.end_date || hackathon.endDate);

  const status = (hackathon.status || 'ACTIVE').toUpperCase();
  const getStatusVariant = (s) => {
    if (s === 'ACTIVE') return 'success';
    if (s === 'DRAFT') return 'warning';
    if (s === 'ENDED') return 'neutral';
    return 'indigo';
  };

  // Prize & Track summaries
  const prizes = hackathon.prizes || [];
  const prizeDisplay = prizes.length > 0 && prizes[0].amount ? prizes[0].amount : (hackathon.prizePool || '$10,000 Pool');
  const tracks = hackathon.tracks || [];
  const tracksCount = tracks.length;

  const registered = isRegistered || hackathon.isRegistered || false;
  const bannerImage = hackathon.bannerImage || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80';

  return (
    <Card hoverEffect className="flex flex-col justify-between group overflow-hidden border-slate-800/80 hover:border-indigo-500/40 transition-all duration-300">
      <div>
        {/* Banner Image */}
        <div className="relative h-44 w-full overflow-hidden bg-slate-950">
          <img
            src={bannerImage}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
            <Badge variant={getStatusVariant(status)} pulse={status === 'ACTIVE'}>
              {status}
            </Badge>
            {registered && (
              <Badge variant="emerald" className="shadow-lg shadow-emerald-950/60 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Registered
              </Badge>
            )}
          </div>

          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-200">
            <span className="font-semibold text-emerald-400 bg-slate-950/80 px-2.5 py-1 rounded-md border border-slate-800">
              {prizeDisplay}
            </span>
            <span className="bg-slate-950/80 px-2 py-1 rounded text-[11px] font-mono border border-slate-800 text-indigo-300 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Online
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <div>
            <span className="text-[11px] text-slate-400 font-medium">{organizer}</span>
            <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
              {name}
            </h3>
          </div>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{description}</p>

          {tracksCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-purple-300">
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span className="line-clamp-1">{tracks.map((t) => t.name).join(', ')}</span>
            </div>
          )}

          <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 truncate">
              <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>{startDate}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <Calendar className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Ends {endDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-slate-950/70 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(`/hackathons/${hackathon.id}`)}
        >
          View Details
        </Button>

        {registered ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-emerald-400 hover:text-emerald-300"
            icon={CheckCircle2}
            onClick={() => navigate('/dashboard/hackathons')}
          >
            Registered
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            icon={ArrowRight}
            iconPosition="right"
            onClick={() => navigate(`/hackathons/${hackathon.id}/register`)}
          >
            Register
          </Button>
        )}
      </div>
    </Card>
  );
}
