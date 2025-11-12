'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { slugify } from '@/lib/utils';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ChevronDown, ChevronUp } from 'lucide-react';

const difficulties = ['Easy', 'Medium', 'Hard'];

interface TopicSelectionProps {
  roleSlug: string;
  roleName: string;
  topics: Record<string, string[]>;
}

interface SelectedTopic {
  [key: string]: {
    difficulty: string;
    subTopics: string[];
  };
}

export default function TopicSelection({
  roleSlug,
  topics,
  roleName,
}: TopicSelectionProps) {
  const router = useRouter();
  const [selectedTopics, setSelectedTopics] = useState<SelectedTopic>({});
  const [questionCount, setQuestionCount] = useState(5);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [activeBulkAction, setActiveBulkAction] = useState<string | null>(null);

  const handleSubtopicChange = (
    mainTopic: string,
    subTopic: string,
    checked: boolean | 'indeterminate'
  ) => {
    setSelectedTopics((prev) => {
      const newSelection = { ...prev };
      if (!newSelection[mainTopic]) {
        newSelection[mainTopic] = { difficulty: 'Medium', subTopics: [] };
      }

      if (checked) {
        newSelection[mainTopic].subTopics.push(subTopic);
      } else {
        newSelection[mainTopic].subTopics = newSelection[mainTopic].subTopics.filter(
          (st) => st !== subTopic
        );
        if (newSelection[mainTopic].subTopics.length === 0) {
          delete newSelection[mainTopic];
        }
      }
      return newSelection;
    });
  };

  const handleDifficultyChange = (mainTopic: string, difficulty: string) => {
    setSelectedTopics((prev) => {
      const newSelection = { ...prev };
      if (newSelection[mainTopic]) {
        newSelection[mainTopic].difficulty = difficulty;
      }
      return newSelection;
    });
  };
  
  const handleSelectAll = (mainTopic: string, allSubTopics: string[]) => {
     setSelectedTopics((prev) => {
      const newSelection = { ...prev };
      const currentSubTopics = newSelection[mainTopic]?.subTopics || [];
      
      if(currentSubTopics.length === allSubTopics.length) {
        // Deselect all
         if (newSelection[mainTopic]) {
          delete newSelection[mainTopic];
        }
      } else {
        // Select all
         if (!newSelection[mainTopic]) {
          newSelection[mainTopic] = { difficulty: 'Medium', subTopics: [] };
        }
        newSelection[mainTopic].subTopics = [...allSubTopics];
      }
      
      return newSelection;
    });
  };
  
  const handleSetAllDifficulty = (difficulty: string) => {
      setSelectedTopics((prev) => {
      const newSelection = { ...prev };
      Object.keys(newSelection).forEach(mainTopic => {
        newSelection[mainTopic].difficulty = difficulty;
      });
      return newSelection;
    });
    setActiveBulkAction(null);
  };

  const handleSelectAllTopics = () => {
    Object.entries(topics).forEach(([main, subs]) => handleSelectAll(main, subs));
    setActiveBulkAction(null);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const handleStartInterview = () => {
    const flatTopics: Record<string, string> = {};
    for (const mainTopic in selectedTopics) {
      const { difficulty, subTopics } = selectedTopics[mainTopic];
      for (const subTopic of subTopics) {
        flatTopics[slugify(subTopic)] = difficulty;
      }
    }

    if (Object.keys(flatTopics).length === 0) {
      return;
    }

    const queryParams = new URLSearchParams(flatTopics);
    queryParams.set('role', roleName);
    queryParams.set('questionCount', questionCount.toString());

    router.push(`/interview/start?${queryParams.toString()}`);
  };

  const totalSelectedTopics = Object.values(selectedTopics).reduce(
    (sum, { subTopics }) => sum + subTopics.length,
    0
  );

  const totalCategories = Object.keys(topics).length;
  const selectedCategories = Object.keys(selectedTopics).length;

  // Difficulty distribution
  const difficultyCounts = Object.values(selectedTopics).reduce((acc, { difficulty }) => {
    acc[difficulty] = (acc[difficulty] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-col h-full min-h-[600px]">
      {/* Segmented Bulk Actions */}
      <div className="p-4 sm:p-6 border-b border-white/10">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-white/70 mr-2">Bulk Actions:</span>
          <div className="inline-flex rounded-lg bg-white/5 border border-white/10 p-1 gap-1 backdrop-blur-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAllTopics}
              className={`h-8 px-3 text-xs font-medium transition-all rounded-md ${
                activeBulkAction === 'select-all'
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-white/70 hover:text-white hover:bg-white/8'
              }`}
            >
              Select All
            </Button>
            {difficulties.map((difficulty) => (
              <Button
                key={difficulty}
                variant="ghost"
                size="sm"
                onClick={() => {
                  setActiveBulkAction(`difficulty-${difficulty}`);
                  handleSetAllDifficulty(difficulty);
                }}
                className={`h-8 px-3 text-xs font-medium transition-all rounded-md ${
                  activeBulkAction === `difficulty-${difficulty}`
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-white/70 hover:text-white hover:bg-white/8'
                }`}
              >
                All {difficulty}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Responsive Topic Grid */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {Object.entries(topics).map(([mainTopic, subTopics]) => {
            const isAllSelected = selectedTopics[mainTopic]?.subTopics.length === subTopics.length;
            const isIndeterminate = selectedTopics[mainTopic] && selectedTopics[mainTopic]?.subTopics.length > 0 && !isAllSelected;
            const isExpanded = expandedCategories.has(mainTopic);
            const selectedCount = selectedTopics[mainTopic]?.subTopics.length || 0;
            const currentDifficulty = selectedTopics[mainTopic]?.difficulty || 'Medium';

            return (
              <div
                key={mainTopic}
                className={`group relative rounded-xl border transition-all duration-300 hover:-translate-y-0.5 ${
                  selectedCount > 0
                    ? 'border-primary/50 bg-primary/5 shadow-lg shadow-primary/10 ring-1 ring-primary/20'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
                }`}
              >
                {/* Category Header */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <Checkbox
                        id={`select-all-${slugify(mainTopic)}`}
                        checked={isAllSelected}
                        onCheckedChange={() => handleSelectAll(mainTopic, subTopics)}
                        aria-label={`Select all ${mainTopic}`}
                        className="mt-0.5"
                      />
                      <Label
                        htmlFor={`select-all-${slugify(mainTopic)}`}
                        className="text-base font-semibold text-white cursor-pointer flex-1 leading-tight"
                        onClick={(e) => {
                          e.preventDefault();
                          handleSelectAll(mainTopic, subTopics);
                        }}
                      >
                        {mainTopic}
                      </Label>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-white/50 hover:text-white hover:bg-white/10 flex-shrink-0 transition-all rounded-md"
                      onClick={() => toggleCategory(mainTopic)}
                      aria-label={isExpanded ? 'Collapse category' : 'Expand category'}
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 transition-transform" />
                      ) : (
                        <ChevronDown className="h-4 w-4 transition-transform" />
                      )}
                    </Button>
                  </div>

                  {/* Selection Stats & Difficulty Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs text-white/60">
                      {selectedCount} / {subTopics.length} selected
                    </span>
                    {selectedCount > 0 && (
                      <Badge
                        variant="outline"
                        className={`text-xs font-medium border-current ${
                          currentDifficulty === 'Easy'
                            ? 'text-green-400 border-green-400/30 bg-green-400/10'
                            : currentDifficulty === 'Medium'
                            ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10'
                            : 'text-red-400 border-red-400/30 bg-red-400/10'
                        }`}
                      >
                        {currentDifficulty}
                      </Badge>
                    )}
                  </div>

                  {/* Difficulty Selector (shown when category has selections) */}
                  {selectedCount > 0 && (
                    <div className="mb-3">
                      <Label className="text-xs font-medium text-white/70 mb-2 block">
                        Difficulty
                      </Label>
                      <RadioGroup
                        value={currentDifficulty}
                        onValueChange={(value) => handleDifficultyChange(mainTopic, value)}
                        className="flex gap-3"
                        aria-label={`Difficulty level for ${mainTopic}`}
                      >
                        {difficulties.map((d) => (
                          <div className="flex items-center space-x-1.5" key={d}>
                            <RadioGroupItem
                              value={d}
                              id={`${mainTopic}-${d}`}
                              className="h-3.5 w-3.5 border-white/30 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                            />
                            <Label
                              htmlFor={`${mainTopic}-${d}`}
                              className="text-xs text-white/70 cursor-pointer font-normal hover:text-white transition-colors"
                            >
                              {d}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  )}

                  {/* Expandable Sub-topics List */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-white/10 space-y-2 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                      {subTopics.map((subTopic, idx) => (
                        <div
                          key={subTopic}
                          className="flex items-center space-x-2 group/item animate-in fade-in slide-in-from-left-2"
                          style={{ animationDelay: `${idx * 20}ms` }}
                        >
                          <Checkbox
                            id={`${mainTopic}-${subTopic}`}
                            checked={selectedTopics[mainTopic]?.subTopics.includes(subTopic) || false}
                            onCheckedChange={(checked) =>
                              handleSubtopicChange(mainTopic, subTopic, checked as boolean)
                            }
                            className="h-4 w-4 transition-all group-hover/item:scale-110"
                          />
                          <Label
                            htmlFor={`${mainTopic}-${subTopic}`}
                            className="text-sm text-white/80 cursor-pointer flex-1 group-hover/item:text-white transition-colors"
                          >
                            {subTopic}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky Summary Footer */}
      <div className="sticky bottom-0 border-t border-white/10 bg-white/5 backdrop-blur-xl p-4 sm:p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Selection Stats */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
            <div>
              <span className="text-white/60">Topics:</span>
              <span className="ml-2 font-semibold text-white">{totalSelectedTopics}</span>
            </div>
            <div>
              <span className="text-white/60">Categories:</span>
              <span className="ml-2 font-semibold text-white">
                {selectedCategories} / {totalCategories}
              </span>
            </div>
            {Object.keys(difficultyCounts).length > 0 && (
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-white/60">Difficulty:</span>
                <div className="flex items-center gap-1.5">
                  {difficulties.map((d) => {
                    const count = difficultyCounts[d] || 0;
                    if (count === 0) return null;
                    return (
                      <Badge
                        key={d}
                        variant="outline"
                        className={`text-xs ${
                          d === 'Easy'
                            ? 'text-green-400 border-green-400/30'
                            : d === 'Medium'
                            ? 'text-yellow-400 border-yellow-400/30'
                            : 'text-red-400 border-red-400/30'
                        }`}
                      >
                        {d}: {count}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Question Count & CTA */}
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <Label htmlFor="question-count" className="text-sm text-white/70 whitespace-nowrap">
                Questions:
              </Label>
              <Input
                id="question-count"
                type="number"
                min="1"
                max={totalSelectedTopics || 1}
                value={questionCount}
                onChange={(e) =>
                  setQuestionCount(
                    Math.max(1, Math.min(totalSelectedTopics, parseInt(e.target.value, 10) || 1))
                  )
                }
                className="w-20 h-9 bg-white/5 border-white/10 text-white"
                disabled={totalSelectedTopics === 0}
              />
            </div>
            <Button
              onClick={handleStartInterview}
              size="lg"
              className="flex-1 sm:flex-initial sm:min-w-[200px] bg-white text-black hover:bg-white/90 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-semibold shadow-lg shadow-white/20"
              disabled={totalSelectedTopics === 0}
            >
              Start Interview
              {totalSelectedTopics > 0 && (
                <span className="ml-2 text-xs bg-black/10 px-2 py-0.5 rounded-full">
                  {totalSelectedTopics}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
