import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  FolderGit2,
  Users,
  User,
  Mail,
  Phone,
  GraduationCap,
  Building,
  MapPin,
  Globe,
  Github,
  Linkedin,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Calendar,
  Award,
  Layers,
  ArrowLeft,
  X,
  Plus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import Button from '../components/Button';
import Input from '../components/Input';
import Badge from '../components/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/Card';
import apiClient from '../api/client';
import { eventsApi } from '../api/events';
import { teamsApi } from '../api/teams';

export default function HackathonRegister() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { success, error: toastError } = useToast();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Registration Status & Success State
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
  const [registrationSuccessData, setRegistrationSuccessData] = useState(null);

  // Participation Type: 'solo' | 'team' | 'join'
  const [participationType, setParticipationType] = useState('solo');

  // Form Fields - Personal Details
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [courseDegree, setCourseDegree] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('3rd Year');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('United States');

  // Form Fields - Professional / Profile
  const [githubProfile, setGithubProfile] = useState('');
  const [linkedinProfile, setLinkedinProfile] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeFileName, setResumeFileName] = useState('');

  // Form Fields - Team Details
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState([
    { name: '', email: '' },
  ]);
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }

    // Pre-fill user data
    if (user) {
      setFullName(user.name || '');
      setEmail(user.email || '');
    }

    const loadEventAndStatus = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch Event
        const evData = await eventsApi.getEventById(id);
        setEvent(evData);

        // 2. Check if already registered
        const regRes = await eventsApi.getRegisteredEvents();
        const myEvents = regRes.items || regRes || [];
        const isReg = myEvents.some((ev) => String(ev.id) === String(id));

        if (isReg) {
          setIsAlreadyRegistered(true);
        }
      } catch (err) {
        console.error('Failed to load event:', err);
        setError(err.response?.data?.error?.message || err.userMessage || 'Hackathon event not found.');
      } finally {
        setLoading(false);
      }
    };

    loadEventAndStatus();
  }, [id, isAuthenticated, user]);

  // Handle Team Member Inputs
  const handleAddMember = () => {
    const maxAllowed = 4; // Max 4 additional members (solo leader + 4 = 5 max)
    if (teamMembers.length >= maxAllowed) {
      toastError(`Maximum ${maxAllowed + 1} members allowed per team.`);
      return;
    }
    setTeamMembers([...teamMembers, { name: '', email: '' }]);
  };

  const handleRemoveMember = (index) => {
    setTeamMembers(teamMembers.filter((_, idx) => idx !== index));
  };

  const handleMemberChange = (index, field, value) => {
    const updated = [...teamMembers];
    updated[index][field] = value;
    setTeamMembers(updated);
  };

  // Resume File Upload handler
  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type: PDF, DOC, DOCX
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const extension = file.name.split('.').pop().toLowerCase();
    const validExtensions = ['pdf', 'doc', 'docx'];

    if (!validTypes.includes(file.type) && !validExtensions.includes(extension)) {
      toastError('Invalid resume format. Please upload a PDF, DOC, or DOCX document.');
      return;
    }

    // Validate size (< 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toastError('File is too large. Maximum resume size is 10MB.');
      return;
    }

    setResumeFile(file);
    setResumeFileName(file.name);
  };

  // URL Validator helper
  const isValidUrl = (urlStr) => {
    if (!urlStr) return true;
    try {
      const url = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};

    if (!fullName.trim()) errors.fullName = 'Full Name is required.';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'A valid email address is required.';
    }
    if (!phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required.';
    }
    if (!collegeName.trim()) {
      errors.collegeName = 'College / University name is required.';
    }
    if (!courseDegree.trim()) {
      errors.courseDegree = 'Course / Degree is required.';
    }
    if (!city.trim()) errors.city = 'City is required.';
    if (!country.trim()) errors.country = 'Country is required.';

    if (githubProfile && !isValidUrl(githubProfile)) {
      errors.githubProfile = 'Please enter a valid GitHub URL.';
    }
    if (linkedinProfile && !isValidUrl(linkedinProfile)) {
      errors.linkedinProfile = 'Please enter a valid LinkedIn URL.';
    }
    if (portfolioUrl && !isValidUrl(portfolioUrl)) {
      errors.portfolioUrl = 'Please enter a valid Portfolio URL.';
    }

    if (participationType === 'team') {
      if (!teamName.trim()) {
        errors.teamName = 'Team name is required for team participation.';
      }
      teamMembers.forEach((member, idx) => {
        if (member.name || member.email) {
          if (!member.name.trim()) errors[`member_${idx}_name`] = 'Member name is required.';
          if (!member.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)) {
            errors[`member_${idx}_email`] = 'Valid member email is required.';
          }
        }
      });
    }

    if (participationType === 'join') {
      if (!inviteCode.trim()) {
        errors.inviteCode = 'Team invite code is required.';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toastError('Please fix validation errors before submitting.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      let createdTeam = null;

      if (participationType === 'team') {
        // Create Team
        createdTeam = await teamsApi.createTeam(id, {
          name: teamName.trim(),
          max_size: 5,
        });
      } else if (participationType === 'join') {
        // Join Team
        createdTeam = await teamsApi.joinTeam(inviteCode.trim());
      } else {
        // Solo Registration
        await eventsApi.registerForEvent(id);
      }

      const registrationRecord = {
        eventName: event?.name || 'Hackathon Event',
        eventId: id,
        participantName: fullName.trim(),
        participantEmail: email.trim(),
        teamName: createdTeam?.name || (participationType === 'team' ? teamName : 'Solo Participation'),
        inviteCode: createdTeam?.invite_code || null,
        registrationStatus: 'Registered',
        registrationDate: new Date().toLocaleString(),
      };

      setRegistrationSuccessData(registrationRecord);
      success('🎉 Registration Successful!');
    } catch (err) {
      console.error('Registration failed:', err);
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.detail ||
        err.userMessage ||
        'Failed to complete registration. Please try again.';
      setError(msg);
      toastError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBD';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner message="Loading hackathon registration..." />
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-8 rounded-2xl bg-rose-950/40 border border-rose-800/60 space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Event Not Found</h2>
          <p className="text-xs text-rose-300">{error}</p>
        </div>
        <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/hackathons')}>
          Back to Hackathons
        </Button>
      </div>
    );
  }

  // 1. Success Screen (Requirement 14)
  if (registrationSuccessData) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <Card className="border-emerald-500/30 bg-slate-900/95 shadow-2xl overflow-hidden">
          <div className="p-8 sm:p-10 text-center space-y-6">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
                Confirmation Notice
              </span>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Registration Successful!
              </h1>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                You have been registered for <strong>{registrationSuccessData.eventName}</strong>. Your entry is active and saved in the database.
              </p>
            </div>

            {/* Registration Summary Box */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block">Hackathon:</span>
                  <span className="font-semibold text-white text-sm">{registrationSuccessData.eventName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Participant:</span>
                  <span className="font-semibold text-white text-sm">{registrationSuccessData.participantName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Team Roster:</span>
                  <span className="font-semibold text-indigo-300 text-sm">{registrationSuccessData.teamName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Status:</span>
                  <Badge variant="emerald" className="mt-0.5">
                    {registrationSuccessData.registrationStatus}
                  </Badge>
                </div>
                <div>
                  <span className="text-slate-400 block">Registered At:</span>
                  <span className="font-mono text-slate-300">{registrationSuccessData.registrationDate}</span>
                </div>
                {registrationSuccessData.inviteCode && (
                  <div>
                    <span className="text-slate-400 block">Team Invite Code:</span>
                    <span className="font-mono text-emerald-400 font-bold tracking-wider">{registrationSuccessData.inviteCode}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Button
                variant="emerald"
                size="lg"
                icon={FolderGit2}
                onClick={() => navigate('/dashboard/hackathons')}
              >
                View My Hackathons
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate(`/hackathons/${id}`)}
              >
                Back to Hackathon
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // 2. Already Registered Screen (Requirement 13)
  if (isAlreadyRegistered) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div>
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate(`/hackathons/${id}`)}>
            Back to {event?.name || 'Hackathon Details'}
          </Button>
        </div>

        <Card className="border-emerald-500/30 bg-slate-900/90 shadow-2xl">
          <CardContent className="p-8 sm:p-10 text-center space-y-6">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                You are already registered for this hackathon
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                Your entry for <strong>{event?.name}</strong> is confirmed. You can review your event dashboard, manage your team, or submit your project.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Button
                variant="emerald"
                icon={FolderGit2}
                onClick={() => navigate('/dashboard/hackathons')}
              >
                View My Hackathons
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate(`/hackathons/${id}`)}
              >
                View Registration Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 3. Full Registration Form (Requirements 8, 9, 10, 11, 12)
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back Button */}
      <div>
        <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate(`/hackathons/${id}`)}>
          Back to {event?.name || 'Hackathon Details'}
        </Button>
      </div>

      {/* Header Banner */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="indigo">Official Registration</Badge>
            <Badge variant={event?.status === 'ACTIVE' ? 'success' : 'neutral'}>
              {event?.status || 'ACTIVE'}
            </Badge>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Register for {event?.name}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            {event?.description || 'Complete the registration form to confirm your participation in this challenge.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>{formatDate(event?.start_date)} &mdash; {formatDate(event?.end_date)}</span>
            </div>
            {event?.prizes?.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>{event.prizes[0].amount || event.prizes[0].name} Prize Pool</span>
              </div>
            )}
            {event?.tracks?.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>{event.tracks.length} Tracks Available</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Section 1: Personal Details */}
        <Card className="border-indigo-500/20">
          <CardHeader>
            <CardTitle icon={User}>1. Personal Details</CardTitle>
            <CardDescription>Enter your primary contact and academic information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                placeholder="Alex Chen"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={formErrors.fullName}
              />
              <Input
                label="Email Address *"
                type="email"
                icon={Mail}
                placeholder="alex.chen@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={formErrors.email}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone Number *"
                icon={Phone}
                placeholder="+1 (555) 019-2834"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                error={formErrors.phoneNumber}
              />
              <Input
                label="College / University Name *"
                icon={Building}
                placeholder="Massachusetts Institute of Technology"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                error={formErrors.collegeName}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Course / Degree *"
                icon={GraduationCap}
                placeholder="B.S. Computer Science"
                value={courseDegree}
                onChange={(e) => setCourseDegree(e.target.value)}
                error={formErrors.courseDegree}
              />

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-300">Year of Study *</label>
                <select
                  value={yearOfStudy}
                  onChange={(e) => setYearOfStudy(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Post-Graduate / Masters">Post-Graduate / Masters</option>
                  <option value="Working Professional">Working Professional</option>
                </select>
              </div>

              <Input
                label="City *"
                icon={MapPin}
                placeholder="San Francisco"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                error={formErrors.city}
              />
            </div>

            <Input
              label="Country *"
              icon={Globe}
              placeholder="United States"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              error={formErrors.country}
            />
          </CardContent>
        </Card>

        {/* Section 2: Professional / Profile Details */}
        <Card className="border-indigo-500/20">
          <CardHeader>
            <CardTitle icon={Github}>2. Professional &amp; Profile Details</CardTitle>
            <CardDescription>Showcase your portfolio, profiles, and resume</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="GitHub Profile URL"
                icon={Github}
                placeholder="https://github.com/username"
                value={githubProfile}
                onChange={(e) => setGithubProfile(e.target.value)}
                error={formErrors.githubProfile}
              />
              <Input
                label="LinkedIn Profile URL"
                icon={Linkedin}
                placeholder="https://linkedin.com/in/username"
                value={linkedinProfile}
                onChange={(e) => setLinkedinProfile(e.target.value)}
                error={formErrors.linkedinProfile}
              />
              <Input
                label="Portfolio / Website URL"
                icon={Globe}
                placeholder="https://myportfolio.dev"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                error={formErrors.portfolioUrl}
              />
            </div>

            {/* Resume Upload Box */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">Resume Upload (PDF, DOC, DOCX)</label>
              <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/60 transition-colors rounded-2xl p-6 text-center bg-slate-950/60">
                <input
                  type="file"
                  id="resume-upload"
                  className="hidden"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleResumeChange}
                />
                <label htmlFor="resume-upload" className="cursor-pointer space-y-2 block">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  {resumeFileName ? (
                    <div className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-semibold">
                      <FileText className="w-4 h-4" />
                      <span>{resumeFileName}</span>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-slate-300 font-semibold">
                        Click to browse or drop your resume here
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Accepts PDF, DOC, DOCX up to 10MB
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Participation & Team Details */}
        <Card className="border-indigo-500/20">
          <CardHeader>
            <CardTitle icon={Users}>3. Participation &amp; Team Details</CardTitle>
            <CardDescription>Choose how you will compete in this hackathon</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Participation Type Buttons */}
            <div className="grid grid-cols-3 gap-3 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs font-medium">
              <button
                type="button"
                onClick={() => setParticipationType('solo')}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                  participationType === 'solo'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Solo Hacker</span>
              </button>

              <button
                type="button"
                onClick={() => setParticipationType('team')}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                  participationType === 'team'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Create New Team</span>
              </button>

              <button
                type="button"
                onClick={() => setParticipationType('join')}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                  participationType === 'join'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Join with Code</span>
              </button>
            </div>

            {/* Participation Mode Conditional Views */}
            {participationType === 'solo' && (
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300">
                You are registering as an individual participant. You will have full access to submit your project independently.
              </div>
            )}

            {participationType === 'team' && (
              <div className="space-y-4 pt-2">
                <Input
                  label="Team Name *"
                  placeholder="e.g. Apex Builders"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  error={formErrors.teamName}
                />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-300">
                      Team Members (Max 5 Total)
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      icon={Plus}
                      onClick={handleAddMember}
                      className="text-indigo-400"
                    >
                      Add Member
                    </Button>
                  </div>

                  {teamMembers.map((member, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-300">
                          Team Member #{idx + 1}
                        </span>
                        {teamMembers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(idx)}
                            className="text-slate-500 hover:text-rose-400"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          label="Member Name"
                          placeholder="e.g. Jordan Lee"
                          value={member.name}
                          onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                          error={formErrors[`member_${idx}_name`]}
                        />
                        <Input
                          label="Member Email"
                          placeholder="jordan.lee@example.com"
                          value={member.email}
                          onChange={(e) => handleMemberChange(idx, 'email', e.target.value)}
                          error={formErrors[`member_${idx}_email`]}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {participationType === 'join' && (
              <div className="space-y-3 pt-2">
                <Input
                  label="Team Invite Code *"
                  placeholder="e.g. sK9fA2xZ"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  error={formErrors.inviteCode}
                />
                <p className="text-[11px] text-slate-400">
                  Enter the 8-character invite code shared by your team leader.
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="justify-between border-t border-slate-800 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(`/hackathons/${id}`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="emerald"
              size="lg"
              icon={CheckCircle2}
              isLoading={submitting}
            >
              Submit Registration
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
