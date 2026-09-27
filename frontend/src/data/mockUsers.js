export const mockUsers = {
  currentUser: {
    id: 'usr-101',
    name: 'Alex Chen',
    email: 'alex.chen@example.com',
    role: 'participant', // 'participant' or 'organizer'
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    bio: 'Full-stack software architect specializing in distributed systems, FastAPI, React, and local LLM tooling.',
    github: 'https://github.com/alexchen',
    linkedin: 'https://linkedin.com/in/alexchen',
    skills: ['Python', 'FastAPI', 'React', 'TypeScript', 'Docker', 'PostgreSQL', 'Tailwind CSS'],
    registeredHackathons: ['hack-1', 'hack-2'],
    activeTeams: ['team-1'],
  },
  organizerUser: {
    id: 'usr-organizer',
    name: 'OpenSource Admin',
    email: 'admin@opensourcefoundation.org',
    role: 'organizer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    bio: 'Hackathon Director & OpenSource Platform Lead.',
    github: 'https://github.com/os-admin',
    skills: ['Platform Engineering', 'Community Leadership', 'Event Management'],
  },
};
