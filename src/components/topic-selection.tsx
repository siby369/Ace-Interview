'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { slugify } from '@/lib/utils';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

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

      if (currentSubTopics.length === allSubTopics.length) {
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
  }

  const handleStartInterview = () => {
    const flatTopics: Record<string, string> = {};
    for (const mainTopic in selectedTopics) {
      const { difficulty, subTopics } = selectedTopics[mainTopic];
      for (const subTopic of subTopics) {
        flatTopics[slugify(subTopic)] = difficulty;
      }
    }

    if (Object.keys(flatTopics).length === 0) {
      // Maybe show a toast or message
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

  return (
    <div className="mt-8 w-full max-w-4xl mx-auto">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => Object.entries(topics).forEach(([main, subs]) => handleSelectAll(main, subs))}
          className="border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white"
        >
          Select All Topics
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSetAllDifficulty('Easy')}
          className="border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white"
        >
          Set All to Easy
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSetAllDifficulty('Medium')}
          className="border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white"
        >
          Set All to Medium
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSetAllDifficulty('Hard')}
          className="border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white"
        >
          Set All to Hard
        </Button>
      </div>

      <Accordion type="multiple" className="w-full space-y-4">
        {Object.entries(topics).map(([mainTopic, subTopics]) => {
          const isAllSelected = selectedTopics[mainTopic]?.subTopics.length === subTopics.length;
          const isIndeterminate = selectedTopics[mainTopic] && selectedTopics[mainTopic]?.subTopics.length > 0 && !isAllSelected;
          const selectedCount = selectedTopics[mainTopic]?.subTopics.length || 0;

          return (
            <AccordionItem
              key={mainTopic}
              value={mainTopic}
              className={cn(
                "rounded-xl border border-white/10 bg-white/[0.015] hover:bg-white/[0.03]",
                "p-4 transition-all shadow-[0_0_25px_rgba(255,255,255,0.03)]",
                "border-b-0"
              )}
            >
              {/* Header */}
              <div className="flex items-center gap-3">
                {/* Checkbox on left */}
                <Checkbox
                  id={`select-all-${slugify(mainTopic)}`}
                  checked={isAllSelected}
                  onCheckedChange={() => handleSelectAll(mainTopic, subTopics)}
                  aria-label={`Select all ${mainTopic}`}
                  className="flex-shrink-0"
                />

                {/* Title on left */}
                <Label
                  htmlFor={`select-all-${slugify(mainTopic)}`}
                  className="text-base font-semibold text-white flex-1 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSelectAll(mainTopic, subTopics);
                  }}
                >
                  {mainTopic}
                </Label>

                {/* Badge on right */}
                <Badge className="bg-white/10 text-white/70 text-xs px-2 border-0 flex-shrink-0 rounded-full">
                  {selectedCount} / {subTopics.length}
                </Badge>

                {/* Chevron on right (animated) */}
                <AccordionTrigger className="flex-shrink-0 p-0 ml-2 hover:no-underline [&[data-state=open]>svg]:rotate-90">
                  <ChevronRight className="h-4 w-4 shrink-0 text-white/60 transition-transform duration-200" />
                </AccordionTrigger>
              </div>

              {/* Content */}
              <AccordionContent className="pt-4">
                <div className="space-y-4">
                  {/* Difficulty Selector */}
                  <div>
                    <Label className="text-sm font-semibold text-white/90 mb-3 block">
                      Difficulty for {mainTopic}
                    </Label>
                    <RadioGroup
                      value={selectedTopics[mainTopic]?.difficulty || 'Medium'}
                      onValueChange={(value) => handleDifficultyChange(mainTopic, value)}
                      className="flex gap-4"
                      disabled={selectedCount === 0}
                    >
                      {difficulties.map((d) => (
                        <div className="flex items-center space-x-2" key={d}>
                          <RadioGroupItem
                            value={d}
                            id={`${mainTopic}-${d}`}
                            className="border-white/20"
                            disabled={selectedCount === 0}
                          />
                          <Label
                            htmlFor={`${mainTopic}-${d}`}
                            className={cn(
                              "text-sm text-white/80 cursor-pointer",
                              selectedCount === 0 && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            {d}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Subtopic Checkboxes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {subTopics.map((subTopic) => (
                      <div
                        key={subTopic}
                        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/5 transition-colors"
                      >
                        <Checkbox
                          id={`${mainTopic}-${subTopic}`}
                          checked={selectedTopics[mainTopic]?.subTopics.includes(subTopic) || false}
                          onCheckedChange={(checked) => handleSubtopicChange(mainTopic, subTopic, checked)}
                          className="flex-shrink-0"
                        />
                        <Label
                          htmlFor={`${mainTopic}-${subTopic}`}
                          className="text-sm text-white/80 font-normal cursor-pointer flex-1"
                        >
                          {subTopic}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Footer Actions */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center">
        <div className="w-full sm:w-auto flex items-center gap-2">
          <Label htmlFor="question-count" className='whitespace-nowrap text-white'>
            Number of Questions
          </Label>
          <Input
            id="question-count"
            type="number"
            min="1"
            max={totalSelectedTopics || 1}
            value={questionCount}
            onChange={e =>
              setQuestionCount(
                Math.max(1, Math.min(totalSelectedTopics, parseInt(e.target.value, 10) || 1))
              )
            }
            className="w-20 bg-white/5 border-white/10 text-white"
            disabled={totalSelectedTopics === 0}
          />
        </div>
        <Button
          onClick={handleStartInterview}
          size="lg"
          className="w-full sm:flex-1 bg-white text-black hover:bg-white/90"
          disabled={totalSelectedTopics === 0}
        >
          Start Interview ({totalSelectedTopics} {totalSelectedTopics === 1 ? 'Topic' : 'Topics'})
        </Button>
      </div>
    </div>
  );
}
