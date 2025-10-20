import type { Feedback } from '@/lib/types';
import { BarChart, CheckCircle2, Lightbulb, MessageSquareQuote, ShieldCheck, Speech, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

interface FeedbackDisplayProps {
  feedback: Feedback;
}

const getScoreColorClass = (score: number) => {
  if (score >= 80) return '[&>div]:bg-green-500'; // A strong positive color
  if (score >= 50) return '[&>div]:bg-yellow-500'; // A neutral/warning color
  return '[&>div]:bg-red-500'; // A clear negative color
};

export function FeedbackDisplay({ feedback }: FeedbackDisplayProps) {
  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline text-2xl">
            <Lightbulb className="h-6 w-6 text-primary" />
            Answer Feedback
          </CardTitle>
          <CardDescription>
            Here's a breakdown of your performance for this question.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold flex items-center gap-2">
                <BarChart className="h-5 w-5 text-muted-foreground" />
                Content Score
              </h3>
              <span className="font-bold text-lg text-primary">
                {feedback.overallScore}/100
              </span>
            </div>
            <Progress
              value={feedback.overallScore}
              className={`h-3 ${getScoreColorClass(feedback.overallScore)}`}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">General Feedback</h3>
            <p className="text-muted-foreground">{feedback.feedback}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3 p-4 rounded-lg bg-secondary">
              <h3 className="font-semibold flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                Strengths
              </h3>
              <p className="text-sm text-muted-foreground">{feedback.strengths}</p>
            </div>
            <div className="space-y-3 p-4 rounded-lg bg-secondary">
              <h3 className="font-semibold flex items-center gap-2 text-destructive">
                <XCircle className="h-5 w-5" />
                Weaknesses
              </h3>
              <p className="text-sm text-muted-foreground">{feedback.weaknesses}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-lg mb-4">Detailed Analysis</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Answer Structure</h4>
                  <p className="text-muted-foreground text-sm">
                    {feedback.answerStructure}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <MessageSquareQuote className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Language and Clarity</h4>
                  <p className="text-muted-foreground text-sm">
                    {feedback.languageAnalysis}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {feedback.pronunciationAnalysis && (
         <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                <Speech className="h-6 w-6 text-primary" />
                Pronunciation Feedback
              </CardTitle>
              <CardDescription>
                An analysis of your spoken response.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold flex items-center gap-2">
                      <BarChart className="h-5 w-5 text-muted-foreground" />
                      Pronunciation Score
                    </h3>
                    <span className="font-bold text-lg text-primary">
                      {feedback.pronunciationAnalysis.overallScore}/100
                    </span>
                  </div>
                  <Progress
                    value={feedback.pronunciationAnalysis.overallScore}
                    className={`h-3 ${getScoreColorClass(feedback.pronunciationAnalysis.overallScore)}`}
                  />
                </div>
                
                <Separator/>

                 <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Your Pronunciation:</h3>
                    <p className='text-lg p-4 rounded-md bg-secondary'>
                        {feedback.pronunciationAnalysis.wordLevelFeedback.map((word, index) => (
                            <span key={index} className={!word.isCorrect ? 'text-destructive font-bold underline' : 'text-accent-foreground'}>
                                {word.word}{' '}
                            </span>
                        ))}
                    </p>
                </div>
                
                <div className="space-y-2">
                    <h3 className="font-semibold text-lg">AI Coach Feedback:</h3>
                    <p className="text-muted-foreground">{feedback.pronunciationAnalysis.generalFeedback}</p>
                </div>

                {feedback.pronunciationAnalysis.wordLevelFeedback.some(w => !w.isCorrect) && (
                     <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="item-1">
                        <AccordionTrigger>Show Suggestions for Mispronounced Words</AccordionTrigger>
                        <AccordionContent>
                           <ul className="list-disc list-inside space-y-2 text-muted-foreground pt-2">
                              {feedback.pronunciationAnalysis.wordLevelFeedback.filter(w => !w.isCorrect && w.feedback).map((word, index) => (
                                  <li key={index}>
                                      <span className='font-bold text-foreground'>{word.word}:</span> {word.feedback}
                                  </li>
                              ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                )}

            </CardContent>
         </Card>
      )}
    </div>
  );
}
