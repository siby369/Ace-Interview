'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { slugify } from '@/lib/utils';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { cn } from '@/lib/utils';
import { TopicCard } from './topic-card';
import { StartButton } from './start-button';
import { motion, AnimatePresence } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { loadPracticeSettings } from '@/lib/storage';
import type { InterviewPersona } from '@/lib/types';
import { parseJobDescription, type ParseJobDescriptionOutput } from '@/ai/flows/parse-job-description';
import { Briefcase, ChevronDown, ChevronUp, Loader2, CheckCircle2 } from 'lucide-react';

const difficulties = ['Easy', 'Medium', 'Hard'];

interface TopicSelectionProps {
  roleSlug: string;
  roleName: string;
  topics: Record<string, string[]>;
}

// Flatten structure for simpler UI: Main Topics become cards.
// We select "All Subtopics" by default when a Main Topic is clicked.
interface SelectedTopicState {
  [mainTopic: string]: {
    difficulty: string;
    // We implicitly assume all subtopics are selected if the main topic is "selected" in this simplified UI.
    // However, to keep compatibility with backend expecting subtopics, we will store them.
    subTopics: string[];
  };
}

export default function TopicSelection({
  roleSlug,
  topics,
  roleName,
}: TopicSelectionProps) {
  const router = useRouter();
  const settings = loadPracticeSettings();
  const [selectedTopics, setSelectedTopics] = useState<SelectedTopicState>({});
  const [questionCount, setQuestionCount] = useState(5);
  const [company, setCompany] = useState('');
  const [persona, setPersona] = useState<InterviewPersona>(settings.preferredPersona);
  const [showJdPanel, setShowJdPanel] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [jdContext, setJdContext] = useState<ParseJobDescriptionOutput | null>(null);

  const handleTopicToggle = (mainTopic: string, allSubTopics: string[]) => {
    setSelectedTopics((prev) => {
      const newSelection = { ...prev };
      if (newSelection[mainTopic]) {
        delete newSelection[mainTopic];
      } else {
        newSelection[mainTopic] = {
          difficulty: settings.defaultDifficulty,
          subTopics: [...allSubTopics] // Select all subtopics by default
        };
      }
      return newSelection;
    });
  };

  const handleDifficultyChange = (mainTopic: string, difficulty: string) => {
    setSelectedTopics((prev) => {
      if (!prev[mainTopic]) return prev;
      return {
        ...prev,
        [mainTopic]: {
          ...prev[mainTopic],
          difficulty
        }
      };
    });
  };

  const handleSetAllDifficulty = (difficulty: string) => {
    setSelectedTopics((prev) => {
      const newSelection = { ...prev };
      Object.keys(newSelection).forEach((key) => {
        newSelection[key].difficulty = difficulty;
      });
      return newSelection;
    });
  };

  const handleSelectAllTopics = () => {
    const allSelected = Object.keys(topics).every(t => selectedTopics[t]);
    if (allSelected) {
      setSelectedTopics({});
    } else {
      const newSelection: SelectedTopicState = {};
      Object.entries(topics).forEach(([main, subs]) => {
        newSelection[main] = { difficulty: settings.defaultDifficulty, subTopics: [...subs] };
      });
      setSelectedTopics(newSelection);
    }
  };

  const handleParseJD = async () => {
    if (!jobDescription.trim()) return;
    setIsParsing(true);
    try {
      const result = await parseJobDescription({ jobDescription, companyName: company || undefined });
      setJdContext(result);
    } catch (e) {
      console.error('Failed to parse JD', e);
    } finally {
      setIsParsing(false);
    }
  };

  const handleStartInterview = () => {
    const flatTopics: Record<string, string> = {};
    for (const mainTopic in selectedTopics) {
      const { difficulty, subTopics } = selectedTopics[mainTopic];
      // For this simplified UI, we send all subtopics
      for (const subTopic of subTopics) {
        flatTopics[slugify(subTopic)] = difficulty;
      }
    }

    if (Object.keys(flatTopics).length === 0) return;

    const queryParams = new URLSearchParams(flatTopics);
    queryParams.set('role', roleName);
    queryParams.set('questionCount', questionCount.toString());
    queryParams.set('persona', persona);
    if (company.trim()) queryParams.set('company', company.trim());
    if (jdContext) queryParams.set('jdContext', JSON.stringify(jdContext));

    router.push(`/interview/start?${queryParams.toString()}`);
  };
  // const totalSubtopics = Object.values(selectedTopics).reduce((acc, curr) => acc + curr.subTopics.length, 0);
  const selectedCount = Object.keys(selectedTopics).length;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="w-full max-w-6xl mx-auto pb-32">
      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm"
      >
        <div className="flex flex-wrap gap-2 items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAllTopics}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            {Object.keys(topics).every(t => selectedTopics[t]) ? 'Deselect All' : 'Select All'}
          </Button>
          <div className="w-px h-6 bg-white/10 mx-2 self-center" />
          {(['Easy', 'Medium', 'Hard'] as const).map((d) => (
            <Button
              key={d}
              variant="ghost"
              size="sm"
              onClick={() => handleSetAllDifficulty(d)}
              disabled={selectedCount === 0}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              All {d}
            </Button>
          ))}
          <div className="w-px h-6 bg-white/10 mx-2 self-center hidden md:block" />
          <Input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Company target"
            className="w-44 h-9 bg-black/20 border-white/10 text-white placeholder:text-white/40"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowJdPanel(!showJdPanel)}
            className={`text-white/70 hover:text-white hover:bg-white/10 ${showJdPanel ? 'bg-primary/10 text-primary' : ''}`}
          >
            <Briefcase className="mr-1.5 h-3.5 w-3.5" />
            {jdContext ? 'JD Loaded ✓' : 'Paste JD'}
            {showJdPanel ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
          </Button>
          <Select value={persona} onValueChange={(value) => setPersona(value as InterviewPersona)}>
            <SelectTrigger className="w-40 h-9 bg-black/20 border-white/10 text-white">
              <SelectValue placeholder="Persona" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="friendly">Friendly</SelectItem>
              <SelectItem value="strict">Strict</SelectItem>
              <SelectItem value="faang">FAANG</SelectItem>
              <SelectItem value="rapid-fire">Rapid Fire</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3 bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
          <Label htmlFor="q-count" className="text-sm font-medium text-white/60">Questions:</Label>
          <Input
            id="q-count"
            type="number"
            min="1"
            max="10"
            value={questionCount}
            onChange={(e) => setQuestionCount(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
            className="w-14 h-8 bg-transparent border-none text-right font-mono text-white focus-visible:ring-0 p-0"
          />
        </div>
      </motion.div>

      {/* JD Panel */}
      <AnimatePresence>
        {showJdPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mb-6"
          >
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 space-y-4">
              <p className="text-sm text-white/70">
                Paste the job description below. The AI will extract required skills and company culture to generate hyper-targeted questions.
              </p>
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here..."
                className="min-h-[160px] bg-black/30 border-white/10 text-white placeholder:text-white/30 resize-none"
              />
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  onClick={handleParseJD}
                  disabled={isParsing || !jobDescription.trim()}
                  className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40"
                  variant="outline"
                >
                  {isParsing ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing JD...</>
                  ) : (
                    <><Briefcase className="mr-2 h-4 w-4" />Analyze Job Description</>
                  )}
                </Button>
                {jdContext && (
                  <div className="flex items-center gap-2 text-emerald-400 text-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>JD analyzed — <strong>{jdContext.seniority}</strong> · {jdContext.focusAreas.slice(0, 2).join(', ')}</span>
                  </div>
                )}
              </div>
              {jdContext && (
                <div className="text-xs text-white/50 border border-white/10 rounded-lg p-3 bg-white/5 space-y-1">
                  <p><span className="text-white/80">Culture:</span> {jdContext.companyCulture}</p>
                  <p><span className="text-white/80">Angle:</span> {jdContext.questionAngle}</p>
                  <p><span className="text-white/80">Skills:</span> {jdContext.extractedSkills.slice(0, 6).join(', ')}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {Object.entries(topics).map(([mainTopic, subTopics]) => {
          const isSelected = !!selectedTopics[mainTopic];
          const difficulty = selectedTopics[mainTopic]?.difficulty || 'Medium';

          return (
            <motion.div key={mainTopic} variants={itemVariants} className="[perspective:1000px]">
              <TopicCard
                topic={mainTopic}
                subTopicCount={subTopics.length}
                isSelected={isSelected}
                difficulty={difficulty}
                onSelect={() => handleTopicToggle(mainTopic, subTopics)}
                onDifficultyChange={(d) => handleDifficultyChange(mainTopic, d)}
              />
            </motion.div>
          );
        })}
      </motion.div>

      <StartButton
        onClick={handleStartInterview}
        count={selectedCount}
        disabled={selectedCount === 0}
      />
    </div>
  );
}
