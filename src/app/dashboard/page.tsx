'use client';

import { useEffect, useMemo, useState } from 'react';
import { loadInterviewSessions } from '@/lib/storage';
import type { InterviewSessionRecord } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Bookmark, CalendarDays, ChartNoAxesCombined, Flame, Route, Share2, Trophy, Grid3X3, MoreHorizontal } from 'lucide-react';
import { SkillHeatmap } from '@/components/skill-heatmap';
import { motion } from 'framer-motion';
import { SettingsPanel } from '@/components/settings-panel';

export default function DashboardPage() {
  const [sessions, setSessions] = useState<InterviewSessionRecord[]>([]);

  useEffect(() => {
    const refresh = () => setSessions(loadInterviewSessions());
    refresh();
    window.addEventListener('ace-interview:sessions-updated', refresh as EventListener);
    return () => window.removeEventListener('ace-interview:sessions-updated', refresh as EventListener);
  }, []);

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
    const text = `Ace Interview session for ${session.role}${session.company ? ` at ${session.company}` : ''}\nScore snapshot: ${session.answers.length ? Math.round(session.answers.reduce((acc, item) => acc + item.score, 0) / session.answers.length) : 0}\nBookmarks: ${session.bookmarkedQuestions.length}`;
    if (navigator.share) {
      await navigator.share({ title: 'Ace Interview session', text });
      return;
    }
    await navigator.clipboard.writeText(text);
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
                          <button onClick={() => shareSession(session)} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/10 hover:text-[#E1E0CC] text-[#E1E0CC]/40 transition-colors">
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => exportSession(session)} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/10 hover:text-[#E1E0CC] text-[#E1E0CC]/40 transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
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
    </div>
  );
}
