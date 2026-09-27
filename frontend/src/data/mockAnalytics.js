export const mockAnalytics = {
  registrationTrends: [
    { date: 'Sep 15', registrations: 45, submissions: 5 },
    { date: 'Sep 18', registrations: 90, submissions: 15 },
    { date: 'Sep 21', registrations: 160, submissions: 32 },
    { date: 'Sep 24', registrations: 240, submissions: 55 },
    { date: 'Sep 27', registrations: 340, submissions: 85 },
  ],
  categoryDistribution: [
    { name: 'AI & ML', value: 42, color: '#6366f1' },
    { name: 'Systems & Tools', value: 28, color: '#10b981' },
    { name: 'Cybersecurity', value: 18, color: '#f59e0b' },
    { name: 'Sustainability', value: 12, color: '#ec4899' },
  ],
  submissionStatus: [
    { name: 'Evaluated', count: 48, fill: '#10b981' },
    { name: 'Under Review', count: 24, fill: '#f59e0b' },
    { name: 'Drafts', count: 13, fill: '#6366f1' },
  ],
  teamSizes: [
    { size: 'Solo (1)', count: 15 },
    { size: '2 Members', count: 28 },
    { size: '3 Members', count: 32 },
    { size: '4 Members', count: 10 },
  ],
};
