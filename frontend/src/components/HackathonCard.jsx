import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Award, ArrowRight } from 'lucide-react';
import { Card } from './Card';
import Badge from './Badge';
import Button from './Button';

export default function HackathonCard({ hackathon }) {
  const navigate = useNavigate();

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Upcoming':
        return 'indigo';
      case 'Ended':
        return 'neutral';
      default:
        return 'info';
    }
  };

  return (
    <Card hoverEffect className="flex flex-col justify-between group overflow-hidden">
      <div>
        {/* Banner Image */}
        <div className="relative h-44 w-full overflow-hidden bg-slate-950">
          <img
            src={hackathon.bannerImage}
            alt={hackathon.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <Badge variant={getStatusVariant(hackathon.status)} pulse={hackathon.status === 'Active'}>
              {hackathon.status}
            </Badge>
            <Badge variant="neutral" className="bg-slate-950/80 backdrop-blur-md">
              {hackathon.mode}
            </Badge>
          </div>

          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-200">
            <span className="font-semibold text-emerald-400 bg-slate-950/80 px-2.5 py-1 rounded-md border border-slate-800">
              {hackathon.prizePool} Prize Pool
            </span>
            <span className="bg-slate-950/80 px-2 py-1 rounded text-[11px] font-mono border border-slate-800 text-slate-300">
              {hackathon.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <div>
            <span className="text-[11px] text-slate-400 font-medium">{hackathon.organizer}</span>
            <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
              {hackathon.title}
            </h3>
          </div>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{hackathon.tagline}</p>

          <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 truncate">
              <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>{hackathon.startDate}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{hackathon.participantsCount} Hackers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-slate-950/50 border-t border-slate-800/60 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-mono">
          Team: {hackathon.minTeamSize}-{hackathon.maxTeamSize} members
        </span>
        <Button
          variant="secondary"
          size="sm"
          icon={ArrowRight}
          iconPosition="right"
          onClick={() => navigate(`/hackathons/${hackathon.id}`)}
        >
          View Details
        </Button>
      </div>
    </Card>
  );
}
