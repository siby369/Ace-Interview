import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CalendarDays, Trophy, ArrowRight, CheckCircle2, XCircle, Award } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export const revalidate = 0; // dynamic page

interface SharePageProps {
  params: Promise<{ id: string }>;
}

export default async function SharePage({ params }: SharePageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const supabase = await createClient();

  const { data: session, error } = await supabase
    .from('sessions')
    .select(`
      *,
      answers (*)
    `)
    .eq('id', id)
    .eq('is_public', true)
    .single();

  if (error || !session) {
    notFound();
  }

  const completedAnswers = session.answers || [];
  const avgScore = completedAnswers.length 
    ? Math.round(completedAnswers.reduce((acc: number, item: any) => acc + (item.score || 0), 0) / completedAnswers.length) 
    : 0;

  return (
    <div className="relative min-h-screen text-[#E1E0CC] bg-[#080808]">
      {/* Noise overlay */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.7] mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />

      <div className="relative z-10 p-6 sm:p-8 lg:p-10 w-full max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8 mt-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#E1E0CC]/60 font-medium">
                Shared Practice Review
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-[#E1E0CC]">
              {session.role}{session.company ? ` at ${session.company}` : ''}
            </h1>
            <p className="text-sm text-[#E1E0CC]/40 flex items-center gap-2 mt-3">
              <CalendarDays className="w-4 h-4" />
              {new Date(session.updated_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/5 text-sm text-[#E1E0CC]/70">{session.persona}</span>
            {session.completed && (
              <span className="px-3.5 py-1.5 rounded-full bg-[#E1E0CC]/10 text-sm text-[#E1E0CC] font-medium border border-[#E1E0CC]/20">
                Completed
              </span>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-8 flex flex-col justify-between">
            <span className="text-sm font-medium text-[#E1E0CC]/40">Average Score</span>
            <span className="text-5xl md:text-6xl font-medium mt-4 tracking-tighter text-[#E1E0CC]">{avgScore}%</span>
          </div>
          <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-8 flex flex-col justify-between">
            <span className="text-sm font-medium text-[#E1E0CC]/40">Questions Asked</span>
            <span className="text-5xl md:text-6xl font-medium mt-4 tracking-tighter text-[#E1E0CC]">{completedAnswers.length}</span>
          </div>
          <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-8 flex flex-col justify-between">
            <span className="text-sm font-medium text-[#E1E0CC]/40">Performance Tier</span>
            <span className="text-4xl md:text-5xl font-medium mt-4 tracking-tighter text-[#E1E0CC] flex items-center gap-2">
              <Award className="w-8 h-8 opacity-70" />
              {avgScore >= 85 ? 'Elite' : avgScore >= 70 ? 'Strong' : 'Developing'}
            </span>
          </div>
        </div>

        {/* Coach Review Card */}
        {session.summary && (
          <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="p-2 rounded-xl bg-white/5">
                <span>🤖</span>
              </div>
              <h2 className="text-2xl font-medium text-[#E1E0CC]">Coach Session Summary</h2>
            </div>
            <p className="text-base text-[#E1E0CC]/70 leading-relaxed font-light">{session.summary}</p>
            {session.recommended_practice && session.recommended_practice.length > 0 && (
              <div className="pt-4 border-t border-white/5">
                <h3 className="font-semibold text-sm text-[#E1E0CC]/50 uppercase tracking-wider mb-3">Recommended Practice Focus</h3>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {session.recommended_practice.map((item: string) => (
                    <li key={item} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 text-sm text-[#E1E0CC]/80">
                      <span className="text-[#E1E0CC]">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Q&A Breakdown */}
        <div className="space-y-6">
          <h2 className="text-3xl font-medium tracking-tight text-[#E1E0CC] mb-6">Question & Answer Log</h2>
          {completedAnswers.length === 0 ? (
            <p className="text-[#E1E0CC]/40 text-center py-8">No questions logged in this session.</p>
          ) : (
            completedAnswers.map((ans: any, i: number) => {
              const feedbackObj = ans.feedback || {};
              const strengths = feedbackObj.strengths || '';
              const weaknesses = feedbackObj.weaknesses || '';
              const generalFeedback = feedbackObj.feedback || '';

              return (
                <div key={ans.id || i} className="rounded-3xl border border-white/5 bg-white/[0.01] overflow-hidden">
                  <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.01]">
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-[#E1E0CC]/40 tracking-wider uppercase">Question {i + 1}</span>
                      <h3 className="text-xl font-medium text-[#E1E0CC]">{ans.question}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-[#E1E0CC]">{ans.score}%</span>
                      <Progress value={ans.score || 0} className="w-24 h-1.5 bg-white/5 [&>div]:bg-[#E1E0CC]" />
                    </div>
                  </div>

                  <div className="p-8 space-y-6">
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-[#E1E0CC]/40 tracking-wider uppercase">Transcript</h4>
                      <p className="text-base text-[#E1E0CC]/80 font-light italic bg-white/[0.02] border border-white/5 rounded-2xl p-5 leading-relaxed">
                        "{ans.transcript || 'No transcript recorded.'}"
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 pt-4">
                      {strengths && (
                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                          <h4 className="font-semibold text-sm text-green-400 flex items-center gap-2 uppercase tracking-wider">
                            <CheckCircle2 className="w-4 h-4" /> Strengths
                          </h4>
                          <p className="text-sm text-[#E1E0CC]/70 font-light leading-relaxed">{strengths}</p>
                        </div>
                      )}
                      {weaknesses && (
                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                          <h4 className="font-semibold text-sm text-red-400 flex items-center gap-2 uppercase tracking-wider">
                            <XCircle className="w-4 h-4" /> Weaknesses
                          </h4>
                          <p className="text-sm text-[#E1E0CC]/70 font-light leading-relaxed">{weaknesses}</p>
                        </div>
                      )}
                    </div>

                    {generalFeedback && (
                      <div className="space-y-2 pt-4 border-t border-white/5">
                        <h4 className="text-xs font-semibold text-[#E1E0CC]/40 tracking-wider uppercase">Coach Analysis</h4>
                        <p className="text-sm text-[#E1E0CC]/80 font-light leading-relaxed">{generalFeedback}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Link */}
        <div className="flex flex-col items-center justify-center pt-12 border-t border-white/5 text-center space-y-4">
          <p className="text-sm text-[#E1E0CC]/40">Want to test your own interview performance?</p>
          <Link 
            href="/" 
            className="group inline-flex items-center gap-2 rounded-full bg-[#E1E0CC] py-1 pl-5 pr-1 text-sm font-medium text-black transition-all hover:gap-3 cursor-pointer"
          >
            Start Preparing Now
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black transition-transform group-hover:scale-105">
              <ArrowRight className="h-4 w-4 text-[#E1E0CC]" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
