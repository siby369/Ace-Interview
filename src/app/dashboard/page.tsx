'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { loadInterviewSessions } from '@/lib/storage';
import type { InterviewSessionRecord } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Bookmark, CalendarDays, ChartNoAxesCombined, Flame, Route, Share2, Trophy, Grid3X3 } from 'lucide-react';
import { SettingsPanel } from '@/components/settings-panel';
import { SkillHeatmap } from '@/components/skill-heatmap';

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
  const allBookmarks = useMemo(
    () => sessions.flatMap((session) => session.bookmarkedQuestions.map((question) => ({ question, session })) ),
    [sessions]
  );

  // Compute per-topic scores for heatmap
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

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8 bg-black text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-white/60">Realtime local dashboard</p>
            <h1 className="text-3xl font-bold font-headline">Your interview progress</h1>
          </div>
          <div className="flex items-center gap-3">
            <SettingsPanel />
            <Button asChild variant="outline" className="border-white/10 bg-white/5 text-white">
              <Link href="/"><ArrowLeft className="h-4 w-4 mr-2" />Home</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card><CardContent className="p-5"><div className="text-white/60 text-sm">Sessions</div><div className="text-3xl font-bold">{totalSessions}</div></CardContent></Card>
          <Card><CardContent className="p-5"><div className="text-white/60 text-sm">Completed</div><div className="text-3xl font-bold">{completed.length}</div></CardContent></Card>
          <Card><CardContent className="p-5"><div className="text-white/60 text-sm">Avg score</div><div className="text-3xl font-bold">{avgScore}</div></CardContent></Card>
          <Card><CardContent className="p-5"><div className="text-white/60 text-sm">Bookmarks</div><div className="text-3xl font-bold">{sessions.reduce((acc, s) => acc + s.bookmarkedQuestions.length, 0)}</div></CardContent></Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="flex items-center gap-2"><ChartNoAxesCombined className="h-5 w-5" />Session history</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {sessions.length === 0 ? <p className="text-white/60">No sessions yet. Start one to see it here in real time.</p> : sessions.map((session) => (
                <div key={session.id} className="rounded-lg border border-white/10 p-4 space-y-2 bg-white/5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-semibold">{session.role}{session.company ? ` • ${session.company}` : ''}</div>
                      <div className="text-xs text-white/50 flex items-center gap-2"><CalendarDays className="h-3 w-3" />{new Date(session.updatedAt).toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{session.persona}</Badge>
                      {session.completed && <Badge className="bg-green-600">Completed</Badge>}
                    </div>
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="text-sm text-white/70 flex flex-wrap gap-2">
                    {Object.entries(session.topics).slice(0, 5).map(([topic, level]) => <Badge key={topic} variant="outline" className="border-white/10">{topic} · {level}</Badge>)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <span><Trophy className="inline h-4 w-4 mr-1" />{session.answers.length} answers</span>
                    <span><Bookmark className="inline h-4 w-4 mr-1" />{session.bookmarkedQuestions.length} bookmarks</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="border-white/10 bg-white/5 text-white" onClick={() => exportSession(session)}>
                      Export
                    </Button>
                    <Button variant="outline" size="sm" className="border-white/10 bg-white/5 text-white" onClick={() => shareSession(session)}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Grid3X3 className="h-5 w-5" />Skill heatmap</CardTitle></CardHeader>
              <CardContent>
                <SkillHeatmap topicScores={topicScores} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Flame className="h-5 w-5" />Next practice</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm text-white/70">
                {weakTopics.length === 0 ? <p>Once feedback is generated, your suggested next steps will appear here.</p> : weakTopics.map((item) => <div key={item} className="rounded-lg bg-white/5 p-3">{item}</div>)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Bookmark className="h-5 w-5" />Saved bookmarks</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm text-white/70">
                {allBookmarks.length === 0 ? (
                  <p>No bookmarks yet. Save questions during a session and they will appear here.</p>
                ) : (
                  allBookmarks.slice(0, 10).map(({ question, session }, idx) => (
                    <div key={`${session.id}-${idx}`} className="rounded-lg bg-white/5 p-3">
                      <div className="text-white">{question}</div>
                      <div className="text-white/40 text-xs mt-1">{session.role}{session.company ? ` • ${session.company}` : ''}</div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Route className="h-5 w-5" />Weekly plan</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm text-white/70">
                <div className="rounded-lg bg-white/5 p-3">20 min/day for 5 days</div>
                <div className="rounded-lg bg-white/5 p-3">2 answer rewrites per day</div>
                <div className="rounded-lg bg-white/5 p-3">1 pronunciation drill session</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
