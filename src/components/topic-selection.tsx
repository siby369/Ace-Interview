'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { slugify } from '@/lib/utils';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import { TopicCard } from './topic-card';
import { StartButton } from './start-button';
import { motion } from 'framer-motion';

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
  const [selectedTopics, setSelectedTopics] = useState<SelectedTopicState>({});
  const [questionCount, setQuestionCount] = useState(5);

  const handleTopicToggle = (mainTopic: string, allSubTopics: string[]) => {
    setSelectedTopics((prev) => {
      const newSelection = { ...prev };
      if (newSelection[mainTopic]) {
        delete newSelection[mainTopic];
      } else {
        newSelection[mainTopic] = {
          difficulty: 'Medium',
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
        newSelection[main] = { difficulty: 'Medium', subTopics: [...subs] };
      });
      setSelectedTopics(newSelection);
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

    router.push(`/interview/start?${queryParams.toString()}`);
  };

  const selectedCount = Object.keys(selectedTopics).length;
  // Calculate total subtopics (optional, maybe overkill for the button text)
  // const totalSubtopics = Object.values(selectedTopics).reduce((acc, curr) => acc + curr.subTopics.length, 0);

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
        <div className="flex gap-2">
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
