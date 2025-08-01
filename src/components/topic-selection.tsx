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

const difficulties = ['Easy', 'Medium', 'Hard'];

interface TopicSelectionProps {
  roleSlug: string;
  roleName: string;
  topics: string[];
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

  const handleDifficultyChange = (topic: string, difficulty: string) => {
    setTopicDifficulties(prev => ({ ...prev, [topic]: difficulty }));
  };

  const handleStartInterview = () => {
    // Filter out topics that haven't had a difficulty set.
    const selectedTopics = Object.entries(topicDifficulties).filter(
      ([, difficulty]) => difficulty
    );

    if (selectedTopics.length === 0) {
      // Maybe show a toast message? For now, just console log.
      console.log('Please select difficulty for at least one topic.');
      return;
    }

    // Format for URL: topic1=difficulty1&topic2=difficulty2
    const queryParams = new URLSearchParams(
      selectedTopics.map(([topic, difficulty]) => [
        slugify(topic),
        slugify(difficulty),
      ])
    );
    // Add roleName to query params to avoid passing it in the URL path and creating complex routes
    queryParams.set('role', roleName);
    
    router.push(`/interview/start?${queryParams.toString()}`);
  };

  return (
    <Card className="mt-8 w-full max-w-2xl">
      <CardContent className="p-6">
        <div className="space-y-6">
          {topics.map(topic => (
            <div
              key={topic}
              className="flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <Label htmlFor={`difficulty-${topic}`} className="text-lg font-medium">
                {topic}
              </Label>
              <Select
                onValueChange={value => handleDifficultyChange(topic, value)}
              >
                <SelectTrigger className="w-full sm:w-[180px]" id={`difficulty-${topic}`}>
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
        <Button
          onClick={handleStartInterview}
          size="lg"
          className="w-full mt-8"
          disabled={Object.keys(topicDifficulties).length === 0}
        >
          Start Interview
        </Button>
      </CardContent>
    </Card>
  );
}
