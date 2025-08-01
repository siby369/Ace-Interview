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
import { useState } from 'react';
import { slugify } from '@/lib/utils';
import { Card, CardContent } from './ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import { Checkbox } from './ui/checkbox';

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

  const handleDifficultyChange = (
    subTopic: string,
    difficulty: string | null
  ) => {
    // When a difficulty is selected, mark the sub-topic as selected
    if (difficulty) {
      setSelectedSubTopics(prev => ({ ...prev, [subTopic]: true }));
      setTopicDifficulties(prev => ({ ...prev, [subTopic]: difficulty }));
    } else {
      // If difficulty is cleared, unselect the sub-topic
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
    // If a sub-topic is deselected, also remove its difficulty setting
    if (!isSelected) {
      const newDifficulties = { ...topicDifficulties };
      delete newDifficulties[subTopic];
      setTopicDifficulties(newDifficulties);
    } else if (!topicDifficulties[subTopic]) {
      // If a sub-topic is selected and has no difficulty, default to Medium
      setTopicDifficulties(prev => ({...prev, [subTopic]: 'Medium'}));
    }
  };

  const handleStartInterview = () => {
    // Filter for topics that are selected and have a difficulty set.
    const selectedTopics = Object.entries(topicDifficulties).filter(
      ([topic]) => selectedSubTopics[topic]
    );

    if (selectedTopics.length === 0) {
      console.log('Please select at least one sub-topic.');
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
        <Accordion type="multiple" className="w-full space-y-4">
          {Object.entries(topics).map(([mainTopic, subTopics]) => (
            <AccordionItem value={mainTopic} key={mainTopic} className="border rounded-lg px-4">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                {mainTopic}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6 pt-4">
                  {subTopics.map(subTopic => (
                    <div
                      key={subTopic}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={`checkbox-${subTopic}`}
                          checked={!!selectedSubTopics[subTopic]}
                          onCheckedChange={checked =>
                            handleSubTopicSelectionChange(subTopic, !!checked)
                          }
                        />
                        <Label
                          htmlFor={`checkbox-${subTopic}`}
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
                          id={`difficulty-${subTopic}`}
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
          ))}
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
