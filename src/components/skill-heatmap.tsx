'use client';

import { useRouter } from 'next/navigation';

interface TopicScore {
  topic: string;
  avgScore: number;
  sessionCount: number;
}

interface SkillHeatmapProps {
  topicScores: TopicScore[];
}

function getColor(score: number, count: number): string {
  if (count === 0) return 'bg-white/5 border-white/10 text-white/30';
  if (score >= 80) return 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300';
  if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300';
  return 'bg-red-500/20 border-red-500/40 text-red-300';
}

function getLabel(score: number, count: number): string {
  if (count === 0) return 'Not practiced';
  if (score >= 80) return `Strong · ${score}`;
  if (score >= 60) return `Developing · ${score}`;
  return `Needs work · ${score}`;
}

export function SkillHeatmap({ topicScores }: SkillHeatmapProps) {
  const router = useRouter();

  if (topicScores.length === 0) {
    return (
      <p className="text-white/60 text-sm">
        Complete interviews to see your skill breakdown here.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {topicScores.map(({ topic, avgScore, sessionCount }) => (
        <button
          key={topic}
          title={`${topic}: ${getLabel(avgScore, sessionCount)}`}
          onClick={() => {
            // Navigate to new interview with this topic pre-suggested
            router.push(`/interview/new`);
          }}
          className={`relative rounded-lg border p-2.5 text-left transition-all duration-200 hover:scale-[1.03] hover:shadow-lg ${getColor(avgScore, sessionCount)}`}
        >
          <p className="text-xs font-medium truncate leading-tight">{topic}</p>
          <p className="text-[10px] mt-0.5 opacity-70">{getLabel(avgScore, sessionCount)}</p>
          {sessionCount > 0 && (
            <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-current opacity-60" />
          )}
        </button>
      ))}
    </div>
  );
}
