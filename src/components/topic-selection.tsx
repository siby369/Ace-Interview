'use client';

import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Label } from './ui/label';
import { useState, useEffect } from 'react';
import { slugify } from '@/lib/utils';
import { Card, CardContent } from './ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import { Checkbox } from './ui/checkbox';
import { ChevronDown } from 'lucide-react';

const difficulties = ['Easy', 'Medium', 'Hard'];

interface TopicSelectionProps {
  roleSlug: string;
  roleName: string;
  topics: Record<string, string[]>;
}

export default function TopicSelection({
  roleSlug,
  topics,
  roleName,
}: TopicSelectionProps) {
  const router = useRouter();
  const [topicDifficulties, setTopicDifficulties] = useState<
    Record<string, string>
  >({});
  const [selectedSubTopics, setSelectedSubTopics] = useState<
    Record<string, boolean>
  >({});
  const [globalDifficulty, setGlobalDifficulty] = useState<string>('');
  const [isAllSelected, setIsAllSelected] = useState(false);

  const allSubtopics = Object.values(topics).flat();

  useEffect(() => {
    const allSelected =
      allSubtopics.length > 0 &&
      allSubtopics.every(subTopic => selectedSubTopics[subTopic]);
    setIsAllSelected(allSelected);
  }, [selectedSubTopics, allSubtopics]);

  const handleSelectAll = (isSelected: boolean) => {
    setIsAllSelected(isSelected);
    const newSelectedSubTopics: Record<string, boolean> = {};
    const newTopicDifficulties: Record<string, string> = {};

    if (isSelected) {
      allSubtopics.forEach(subTopic => {
        newSelectedSubTopics[subTopic] = true;
        newTopicDifficulties[subTopic] =
          topicDifficulties[subTopic] || globalDifficulty || 'Medium';
      });
    }
    // When deselecting, both selected topics and their difficulties are cleared
    setSelectedSubTopics(newSelectedSubTopics);
    setTopicDifficulties(newTopicDifficulties);
  };
  
  const handleMainTopicSelectionChange = (mainTopic: string, isSelected: boolean) => {
    const subTopics = topics[mainTopic];
    const newSelectedSubTopics = { ...selectedSubTopics };
    const newTopicDifficulties = { ...topicDifficulties };

    subTopics.forEach(subTopic => {
      newSelectedSubTopics[subTopic] = isSelected;
      if (isSelected) {
        newTopicDifficulties[subTopic] = topicDifficulties[subTopic] || globalDifficulty || 'Medium';
      } else {
        delete newTopicDifficulties[subTopic];
      }
    });

    setSelectedSubTopics(newSelectedSubTopics);
    setTopicDifficulties(newTopicDifficulties);
  };


  const handleGlobalDifficultyChange = (difficulty: string) => {
    if (!difficulty) return;
    setGlobalDifficulty(difficulty);
    const newTopicDifficulties = { ...topicDifficulties };
    Object.keys(selectedSubTopics).forEach(subTopic => {
      if (selectedSubTopics[subTopic]) {
        newTopicDifficulties[subTopic] = difficulty;
      }
    });
    setTopicDifficulties(newTopicDifficulties);
  };

  const handleDifficultyChange = (
    subTopic: string,
    difficulty: string | null
  ) => {
    if (difficulty) {
      setSelectedSubTopics(prev => ({ ...prev, [subTopic]: true }));
      setTopicDifficulties(prev => ({ ...prev, [subTopic]: difficulty }));
    } else {
      const newDifficulties = { ...topicDifficulties };
      delete newDifficulties[subTopic];
      setTopicDifficulties(newDifficulties);
    }
  };

  const handleSubTopicSelectionChange = (
    subTopic: string,
    isSelected: boolean
  ) => {
    setSelectedSubTopics(prev => ({ ...prev, [subTopic]: isSelected }));
    if (!isSelected) {
      const newDifficulties = { ...topicDifficulties };
      delete newDifficulties[subTopic];
      setTopicDifficulties(newDifficulties);
    } else if (!topicDifficulties[subTopic]) {
      setTopicDifficulties(prev => ({
        ...prev,
        [subTopic]: globalDifficulty || 'Medium',
      }));
    }
  };

  const handleStartInterview = () => {
    const selectedTopics = Object.entries(topicDifficulties).filter(
      ([topic]) => selectedSubTopics[topic]
    );

    if (selectedTopics.length === 0) {
      // This should be handled by the disabled button, but as a fallback
      return;
    }

    const queryParams = new URLSearchParams(
      selectedTopics.map(([topic, difficulty]) => [
        slugify(topic),
        slugify(difficulty),
      ])
    );
    queryParams.set('role', roleName);

    router.push(`/interview/start?${queryParams.toString()}`);
  };

  const isAnyTopicSelected = Object.values(selectedSubTopics).some(
    isSelected => isSelected
  );

  return (
    <Card className="mt-8 w-full max-w-2xl">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center justify-between p-4 mb-6 bg-secondary rounded-lg">
          <div className="flex items-center gap-3">
            <Checkbox
              id="select-all"
              checked={isAllSelected}
              onCheckedChange={checked => handleSelectAll(!!checked)}
            />
            <Label htmlFor="select-all" className="text-base font-semibold">
              Select All Topics
            </Label>
          </div>
          <div className="w-full sm:w-auto">
            <Label htmlFor="global-difficulty" className="sr-only">
              Set All Difficulties
            </Label>
            <Select onValueChange={handleGlobalDifficultyChange}>
              <SelectTrigger
                id="global-difficulty"
                className="w-full sm:w-[180px]"
              >
                <SelectValue placeholder="Set All Difficulties" />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map(difficulty => (
                  <SelectItem key={difficulty} value={difficulty}>
                    {difficulty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Accordion type="multiple" className="w-full space-y-4">
          {Object.entries(topics).map(([mainTopic, subTopics]) => {
            const areAllSubTopicsSelected = subTopics.every(st => selectedSubTopics[st]);
            const areSomeSubTopicsSelected = subTopics.some(st => selectedSubTopics[st]) && !areAllSubTopicsSelected;
            
            return (
              <AccordionItem
                value={mainTopic}
                key={mainTopic}
                className="border rounded-lg px-4"
              >
                <div className="flex items-center w-full">
                   <div className="flex items-center gap-3 py-4">
                     <Checkbox
                       id={`checkbox-main-${slugify(mainTopic)}`}
                       checked={areAllSubTopicsSelected}
                       onCheckedChange={(checked) => handleMainTopicSelectionChange(mainTopic, !!checked)}
                       onClick={(e) => e.stopPropagation()}
                     />
                   </div>
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline flex-1 p-0 justify-start gap-2">
                     <Label htmlFor={`checkbox-main-${slugify(mainTopic)}`} className="text-lg font-semibold cursor-pointer">
                      {mainTopic}
                     </Label>
                  </AccordionTrigger>
                </div>
                <AccordionContent>
                  <div className="space-y-6 pt-4">
                    {subTopics.map(subTopic => (
                      <div
                        key={subTopic}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id={`checkbox-${slugify(subTopic)}`}
                            checked={!!selectedSubTopics[subTopic]}
                            onCheckedChange={checked =>
                              handleSubTopicSelectionChange(subTopic, !!checked)
                            }
                          />
                          <Label
                            htmlFor={`checkbox-${slugify(subTopic)}`}
                            className="text-base font-medium"
                          >
                            {subTopic}
                          </Label>
                        </div>
                        <Select
                          value={topicDifficulties[subTopic] || ''}
                          onValueChange={value =>
                            handleDifficultyChange(subTopic, value)
                          }
                          disabled={!selectedSubTopics[subTopic]}
                        >
                          <SelectTrigger
                            className="w-full sm:w-[180px]"
                            id={`difficulty-${slugify(subTopic)}`}
                          >
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            {difficulties.map(difficulty => (
                              <SelectItem key={difficulty} value={difficulty}>
                                {difficulty}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
        <Button
          onClick={handleStartInterview}
          size="lg"
          className="w-full mt-8"
          disabled={!isAnyTopicSelected}
        >
          Start Interview
        </Button>
      </CardContent>
    </Card>
  );
}
