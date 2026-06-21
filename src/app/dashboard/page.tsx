'use client';

import { useEffect, useMemo, useState } from 'react';
import { loadInterviewSessions, saveInterviewSessions, savePracticeSettings, isValidUuid } from '@/lib/storage';
import type { InterviewSessionRecord, InterviewPersona, PracticeSettings } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Bookmark, CalendarDays, ChartNoAxesCombined, Flame, Route, Share2, Trophy, Grid3X3, MoreHorizontal, Trash2 } from 'lucide-react';
import { SkillHeatmap } from '@/components/skill-heatmap';
import { motion } from 'framer-motion';
import { SettingsPanel } from '@/components/settings-panel';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function DashboardPage() {
  const [sessions, setSessions] = useState<InterviewSessionRecord[]>([]);
  const { toast } = useToast();

  // Confirm dialog states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    description: string;
    action: () => void;
  } | null>(null);

  const showConfirm = (title: string, description: string, action: () => void) => {
    setConfirmConfig({ title, description, action });
    setConfirmOpen(true);
  };

  // Onboarding states
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [onboardRole, setOnboardRole] = useState('');
  const [onboardCompany, setOnboardCompany] = useState('');
  const [onboardDifficulty, setOnboardDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [onboardPersona, setOnboardPersona] = useState<InterviewPersona>('friendly');
  const [onboardMode, setOnboardMode] = useState<'typed' | 'spoken' | 'mixed'>('mixed');

  useEffect(() => {
    const refresh = () => setSessions(loadInterviewSessions());
    refresh();
    window.addEventListener('ace-interview:sessions-updated', refresh as EventListener);
    return () => window.removeEventListener('ace-interview:sessions-updated', refresh as EventListener);
  }, []);

  useEffect(() => {
    async function checkOnboarding() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', user.id)
            .single();

          if (!error && profile) {
            setNeedsOnboarding(!profile.onboarding_completed);
          } else {
            setNeedsOnboarding(true);
          }
        }
      } catch (err) {
        console.error('Error checking onboarding status:', err);
      } finally {
        setLoadingProfile(false);
      }
    }
    
    checkOnboarding();
  }, []);

  const handleOnboardingComplete = async (settings: PracticeSettings, targetRole: string, targetCompany: string) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          practice_settings: settings
        })
        .eq('id', user.id);

      if (error) throw error;

      savePracticeSettings(settings);
      setNeedsOnboarding(false);
      
      toast({
        title: 'Welcome aboard!',
        description: 'Your practice profile has been successfully configured.',
      });
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const totalSessions = sessions.length;
  const completed = sessions.filter((session) => session.completed);
  const allAnswers = completed.flatMap((s) => s.answers);
  const avgScore = allAnswers.length ? Math.round(allAnswers.reduce((acc, item) => acc + item.score, 0) / allAnswers.length) : 0;
  const weakTopics = sessions.flatMap((session) => session.recommendedPractice || []).slice(0, 6);

  const topicScores = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    completed.forEach((session) => {
      session.answers.forEach((answer) => {
        Object.keys(session.topics).forEach((topic) => {
          if (!map[topic]) map[topic] = { total: 0, count: 0 };
          map[topic].total += answer.score;
          map[topic].count += 1;
        });
      });
    });
    return Object.entries(map)
      .map(([topic, { total, count }]) => ({
        topic,
        avgScore: count > 0 ? Math.round(total / count) : 0,
        sessionCount: count,
      }))
      .sort((a, b) => a.avgScore - b.avgScore);
  }, [completed]);

  const exportSession = async (session: InterviewSessionRecord) => {
    const payload = JSON.stringify(session, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ace-interview-${session.role.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareSession = async (session: InterviewSessionRecord) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('sessions')
        .update({ is_public: true })
        .eq('id', session.id);

      if (error) throw error;

      const shareUrl = `${window.location.origin}/share/${session.id}`;
      if (navigator.share) {
        await navigator.share({
          title: `Interview Session - ${session.role}`,
          text: `Check out my Ace Interview practice session for ${session.role}!`,
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: 'Link Copied',
          description: 'Share link copied to clipboard.',
        });
      }
    } catch (err) {
      console.error('Failed to share session:', err);
      toast({
        title: 'Error',
        description: 'Failed to share session. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const deleteSession = (session: InterviewSessionRecord) => {
    showConfirm(
      'Delete Session',
      `Are you sure you want to delete this interview session for ${session.role}? This action cannot be undone.`,
      async () => {
        try {
          // 1. Delete locally
          const updatedSessions = sessions.filter((s) => s.id !== session.id);
          setSessions(updatedSessions);
          saveInterviewSessions(updatedSessions);

          // 2. Delete from Supabase Cloud (if logged in)
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (user && isValidUuid(session.id)) {
            const { error } = await supabase
              .from('sessions')
              .delete()
              .eq('id', session.id);

            if (error) throw error;
          }

          toast({
            title: 'Session deleted',
            description: 'The interview session was successfully removed.',
          });
        } catch (err: any) {
          console.error('Failed to delete session:', err?.message || err);
          toast({
            title: 'Error',
            description: 'Failed to delete session from cloud database.',
            variant: 'destructive',
          });
        }
      }
    );
  };

  const clearHistory = () => {
    if (sessions.length === 0) return;
    showConfirm(
      'Clear Session History',
      'Are you sure you want to delete ALL interview sessions? This action cannot be undone.',
      async () => {
        try {
          // 1. Clear locally
          setSessions([]);
          saveInterviewSessions([]);

          // 2. Clear from Supabase Cloud (if logged in)
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { error } = await supabase
              .from('sessions')
              .delete()
              .eq('user_id', user.id);

            if (error) throw error;
          }

          toast({
            title: 'History cleared',
            description: 'All interview sessions were successfully removed.',
          });
        } catch (err: any) {
          console.error('Failed to clear history:', err?.message || err);
          toast({
            title: 'Error',
            description: 'Failed to clear history from cloud database.',
            variant: 'destructive',
          });
        }
      }
    );
  };

  const CinematicCard = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-sm ${className}`}
    >
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  );

  if (loadingProfile) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#080808] text-[#E1E0CC] overflow-hidden">
        {/* Noise overlay */}
        <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.7] mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />
        <div className="flex flex-col items-center gap-4 text-[#E1E0CC]/40 animate-pulse relative z-10">
          <div className="w-4 h-4 rounded-full bg-[#E1E0CC]/50 animate-ping" />
          <p className="text-sm font-light tracking-wider">Syncing workspace...</p>
        </div>
      </div>
    );
  }

  if (needsOnboarding) {
    return (
      <div className="fixed inset-0 z-40 text-[#E1E0CC] bg-[#080808] flex items-center justify-center p-4 overflow-hidden">
        {/* Noise overlay */}
        <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.7] mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />
        
        <div className="relative z-10 max-w-lg w-full p-8 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-md shadow-2xl space-y-8 animate-in fade-in-50 duration-700">
          <div className="text-center space-y-2">
            <span className="text-xs font-semibold text-[#E1E0CC]/50 uppercase tracking-widest">Step {onboardingStep} of 3</span>
            <h1 className="text-3xl font-medium tracking-tight">Set up your profile</h1>
            <p className="text-[#E1E0CC]/60 text-sm font-light">Help us tailor your virtual interview sessions</p>
          </div>

          {onboardingStep === 1 && (
            <div className="space-y-5 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#E1E0CC]/60 uppercase tracking-wider">Target Job Role</label>
                <input 
                  type="text" 
                  value={onboardRole} 
                  onChange={e => setOnboardRole(e.target.value)} 
                  placeholder="e.g. Frontend Engineer" 
                  className="block w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-white placeholder-white/20 focus:border-[#E1E0CC]/50 focus:outline-none focus:ring-1 focus:ring-[#E1E0CC]/50 text-sm transition-colors" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#E1E0CC]/60 uppercase tracking-wider">Target Company (Optional)</label>
                <input 
                  type="text" 
                  value={onboardCompany} 
                  onChange={e => setOnboardCompany(e.target.value)} 
                  placeholder="e.g. Stripe" 
                  className="block w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-white placeholder-white/20 focus:border-[#E1E0CC]/50 focus:outline-none focus:ring-1 focus:ring-[#E1E0CC]/50 text-sm transition-colors" 
                />
              </div>
              <Button 
                disabled={!onboardRole.trim()}
                onClick={() => setOnboardingStep(2)}
                className="w-full h-12 bg-[#E1E0CC] hover:bg-[#E1E0CC]/90 text-black font-semibold rounded-xl mt-4"
              >
                Continue
              </Button>
            </div>
          )}

          {onboardingStep === 2 && (
            <div className="space-y-5 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#E1E0CC]/60 uppercase tracking-wider block mb-2">Preferred Difficulty</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Easy', 'Medium', 'Hard'] as const).map(diff => (
                    <button 
                      key={diff}
                      type="button"
                      onClick={() => setOnboardDifficulty(diff)}
                      className={`h-11 rounded-xl border text-sm font-medium transition-all ${onboardDifficulty === diff ? 'bg-[#E1E0CC] text-black border-[#E1E0CC]' : 'border-white/10 hover:bg-white/5 text-[#E1E0CC]/70'}`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#E1E0CC]/60 uppercase tracking-wider block mb-2">Interviewer Persona</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['friendly', 'strict', 'faang', 'rapid-fire'] as const).map(pers => (
                    <button 
                      key={pers}
                      type="button"
                      onClick={() => setOnboardPersona(pers)}
                      className={`h-11 rounded-xl border text-sm font-medium capitalize transition-all ${onboardPersona === pers ? 'bg-[#E1E0CC] text-black border-[#E1E0CC]' : 'border-white/10 hover:bg-white/5 text-[#E1E0CC]/70'}`}
                    >
                      {pers.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button 
                  variant="ghost"
                  onClick={() => setOnboardingStep(1)}
                  className="flex-1 h-12 border border-white/10 hover:bg-white/5 text-[#E1E0CC]/70 rounded-xl border-white/10"
                >
                  Back
                </Button>
                <Button 
                  onClick={() => setOnboardingStep(3)}
                  className="flex-1 h-12 bg-[#E1E0CC] hover:bg-[#E1E0CC]/90 text-black font-semibold rounded-xl"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {onboardingStep === 3 && (
            <div className="space-y-5 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#E1E0CC]/60 uppercase tracking-wider block mb-2">Default Response Mode</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['typed', 'spoken', 'mixed'] as const).map(mode => (
                    <button 
                      key={mode}
                      type="button"
                      onClick={() => setOnboardMode(mode)}
                      className={`h-11 rounded-xl border text-sm font-medium capitalize transition-all ${onboardMode === mode ? 'bg-[#E1E0CC] text-black border-[#E1E0CC]' : 'border-white/10 hover:bg-white/5 text-[#E1E0CC]/70'}`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="ghost"
                  onClick={() => setOnboardingStep(2)}
                  className="flex-1 h-12 border border-white/10 hover:bg-white/5 text-[#E1E0CC]/70 rounded-xl border-white/10"
                >
                  Back
                </Button>
                <Button 
                  onClick={() => handleOnboardingComplete({
                    voiceLanguage: 'en-US',
                    defaultDifficulty: onboardDifficulty,
                    preferredPersona: onboardPersona,
                    responseMode: onboardMode
                  }, onboardRole, onboardCompany)}
                  className="flex-1 h-12 bg-[#E1E0CC] hover:bg-[#E1E0CC]/90 text-black font-semibold rounded-xl"
                >
                  Complete Setup
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-[#E1E0CC]">
      <div className="relative z-10 p-6 sm:p-8 lg:p-10 w-full max-w-7xl mx-auto">
        
        {/* Cinematic Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 mt-8"
        >
          <div>
            <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-[#E1E0CC] drop-shadow-sm" style={{ letterSpacing: "-0.05em" }}>
              Welcome back*
            </h1>
            <p className="text-sm tracking-wide text-[#E1E0CC]/50 mt-4 max-w-md">
              Here is an overview of your recent practice sessions and skill development.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <SettingsPanel />
          </div>
        </motion.div>

        {/* Immersive Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Sessions', value: totalSessions },
            { label: 'Completed', value: completed.length },
            { label: 'Average Score', value: avgScore },
            { label: 'Bookmarks', value: sessions.reduce((acc, s) => acc + s.bookmarkedQuestions.length, 0) }
          ].map((stat, i) => (
            <CinematicCard key={stat.label} delay={0.1 + (i * 0.1)} className="p-8 flex flex-col justify-between hover:bg-white/[0.04] transition-colors">
              <span className="text-sm font-medium text-[#E1E0CC]/40">{stat.label}</span>
              <span className="text-5xl md:text-6xl font-medium mt-4 tracking-tighter">{stat.value}</span>
            </CinematicCard>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12">
          {/* Main Feed: Session History */}
          <div className="lg:col-span-2 space-y-6">
            <CinematicCard delay={0.4} className="p-0">
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-2xl font-medium flex items-center gap-3 text-[#E1E0CC]">
                  <ChartNoAxesCombined className="w-6 h-6 opacity-60" />
                  Session History
                </h2>
                {sessions.length > 0 && (
                  <Button
                    variant="ghost"
                    onClick={clearHistory}
                    className="h-9 px-3 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-350 font-medium text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear History
                  </Button>
                )}
              </div>
              <div className="p-8 space-y-4">
                {sessions.length === 0 ? (
                  <div className="text-center py-16 text-[#E1E0CC]/30">
                    <p>No sessions yet. Time to start practicing.</p>
                  </div>
                ) : (
                  sessions.map((session) => (
                    <div key={session.id} className="group rounded-3xl bg-black/20 hover:bg-black/40 border border-white/5 p-6 transition-all duration-500">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                          <h3 className="text-xl font-medium text-[#E1E0CC] transition-colors">
                            {session.role}{session.company ? ` at ${session.company}` : ''}
                          </h3>
                          <p className="text-sm text-[#E1E0CC]/40 flex items-center gap-2 mt-2">
                            <CalendarDays className="w-4 h-4" />
                            {new Date(session.updatedAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-white/5 text-xs text-[#E1E0CC]/60">{session.persona}</span>
                          {session.completed && <span className="px-3 py-1 rounded-full bg-[#E1E0CC]/10 text-xs text-[#E1E0CC]">Completed</span>}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-6">
                        {Object.entries(session.topics).slice(0, 4).map(([topic, level]) => (
                          <span key={topic} className="px-3 py-1 text-xs rounded-full bg-white/5 text-[#E1E0CC]/50 border border-white/5">
                            {topic} · {level}
                          </span>
                        ))}
                        {Object.keys(session.topics).length > 4 && (
                          <span className="px-3 py-1 text-xs rounded-full bg-white/5 text-[#E1E0CC]/40">
                            +{Object.keys(session.topics).length - 4} more
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5">
                        <div className="flex items-center gap-6 text-sm text-[#E1E0CC]/40">
                          <span className="flex items-center gap-2"><Trophy className="w-4 h-4" /> {session.answers.length} Qs</span>
                          <span className="flex items-center gap-2"><Bookmark className="w-4 h-4" /> {session.bookmarkedQuestions.length} Saved</span>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => shareSession(session)} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/10 hover:text-[#E1E0CC] text-[#E1E0CC]/40 transition-colors" title="Share Session">
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => exportSession(session)} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/10 hover:text-[#E1E0CC] text-[#E1E0CC]/40 transition-colors" title="Export JSON">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteSession(session)} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-red-500/10 hover:text-red-400 text-[#E1E0CC]/40 transition-colors" title="Delete Session">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CinematicCard>
          </div>

          {/* Sidebar Widgets */}
          <div className="space-y-6">
            <CinematicCard delay={0.5}>
              <div className="p-6 border-b border-white/5">
                <h3 className="text-xl font-medium flex items-center gap-3 text-[#E1E0CC]">
                  <Grid3X3 className="w-5 h-5 opacity-60" /> Skill Heatmap
                </h3>
              </div>
              <div className="p-6">
                <SkillHeatmap topicScores={topicScores} />
              </div>
            </CinematicCard>

            <CinematicCard delay={0.6}>
              <div className="p-6 border-b border-white/5">
                <h3 className="text-xl font-medium flex items-center gap-3 text-[#E1E0CC]">
                  <Flame className="w-5 h-5 opacity-60" /> Focus Areas
                </h3>
              </div>
              <div className="p-6 space-y-3">
                {weakTopics.length === 0 ? (
                  <p className="text-sm text-[#E1E0CC]/40">Complete more sessions to get tailored practice recommendations.</p>
                ) : (
                  weakTopics.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-sm text-[#E1E0CC]/70 font-medium hover:bg-white/[0.04] transition-colors">
                      {item}
                    </div>
                  ))
                )}
              </div>
            </CinematicCard>
          </div>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="bg-[#0b0b0b] border border-white/10 text-[#E1E0CC]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-medium text-[#E1E0CC]">{confirmConfig?.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-[#E1E0CC]/60">{confirmConfig?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border border-white/10 hover:bg-white/5 hover:text-[#E1E0CC] text-[#E1E0CC]/60 rounded-full px-5 py-2">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                confirmConfig?.action();
              }}
              className="bg-red-500 hover:bg-red-600 text-white font-medium rounded-full px-5 py-2"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
