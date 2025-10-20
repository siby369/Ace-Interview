
'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { slugify } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';

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
        <Card className="animate-in fade-in-50 duration-500">
            <CardHeader>
                <CardTitle>Topic Customization</CardTitle>
                <CardDescription>Fine-tune your interview by selecting specific topics and difficulties.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <div className="flex flex-wrap gap-2 mb-6">
                    <Button variant="outline" size="sm" onClick={() => Object.entries(topics).forEach(([main, subs]) => handleSelectAll(main, subs))}>Select All Topics</Button>
                    <Button variant="outline" size="sm" onClick={() => handleSetAllDifficulty('Easy')}>Set All to Easy</Button>
                    <Button variant="outline" size="sm" onClick={() => handleSetAllDifficulty('Medium')}>Set All to Medium</Button>
                    <Button variant="outline" size="sm" onClick={() => handleSetAllDifficulty('Hard')}>Set All to Hard</Button>
                </div>
                
                <Accordion type="multiple" className="w-full">
                {Object.entries(topics).map(([mainTopic, subTopics]) => {
                    const isAllSelected = selectedTopics[mainTopic]?.subTopics.length === subTopics.length;
                    const isIndeterminate = selectedTopics[mainTopic] && selectedTopics[mainTopic]?.subTopics.length > 0 && !isAllSelected;

                    return (
                    <AccordionItem value={mainTopic} key={mainTopic}>
                         <div className="flex items-center gap-3 py-4">
                            <Checkbox
                                id={`select-all-${slugify(mainTopic)}`}
                                checked={isAllSelected}
                                onCheckedChange={() => handleSelectAll(mainTopic, subTopics)}
                                aria-label={`Select all ${mainTopic}`}
                            />
                            <Label htmlFor={`select-all-${slugify(mainTopic)}`} className="text-lg font-semibold flex-1 cursor-pointer" onClick={(e) => { e.preventDefault(); handleSelectAll(mainTopic, subTopics); }}>
                                {mainTopic} ({selectedTopics[mainTopic]?.subTopics.length || 0} / {subTopics.length})
                            </Label>
                            <AccordionTrigger/>
                        </div>
                        <AccordionContent>
                        <div className="p-4 bg-secondary rounded-md">
                            <div className="mb-4">
                            <Label className="font-semibold">Difficulty for {mainTopic}</Label>
                            <RadioGroup
                                value={selectedTopics[mainTopic]?.difficulty || 'Medium'}
                                onValueChange={(value) => handleDifficultyChange(mainTopic, value)}
                                className="flex mt-2 gap-4"
                                disabled={!selectedTopics[mainTopic]}
                            >
                                {difficulties.map((d) => (
                                <div className="flex items-center space-x-2" key={d}>
                                    <RadioGroupItem value={d} id={`${mainTopic}-${d}`} />
                                    <Label htmlFor={`${mainTopic}-${d}`}>{d}</Label>
                                </div>
                                ))}
                            </RadioGroup>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                            {subTopics.map((subTopic) => (
                                <div className="flex items-center space-x-2" key={subTopic}>
                                <Checkbox
                                    id={subTopic}
                                    checked={selectedTopics[mainTopic]?.subTopics.includes(subTopic)}
                                    onCheckedChange={(checked) => handleSubtopicChange(mainTopic, subTopic, checked)}
                                />
                                <Label htmlFor={subTopic} className="text-sm font-normal">
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
            </CardContent>
        </Card>
        
      <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center">
        <div className="w-full sm:w-auto flex items-center gap-2">
            <Label htmlFor="question-count" className='whitespace-nowrap'>
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
                className="w-20"
                disabled={totalSelectedTopics === 0}
            />
        </div>
        <Button
          onClick={handleStartInterview}
          size="lg"
          className="w-full sm:flex-1"
          disabled={totalSelectedTopics === 0}
        >
          Start Interview ({totalSelectedTopics} {totalSelectedTopics === 1 ? 'Topic' : 'Topics'})
        </Button>
      </div>
    </div>
  );
}
