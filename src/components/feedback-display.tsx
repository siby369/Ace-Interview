import type { Feedback } from '@/lib/types';
import { BarChart, CheckCircle2, Lightbulb, MessageSquareQuote, ShieldCheck, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';

interface FeedbackDisplayProps {
  feedback: Feedback;
}

export function FeedbackDisplay({ feedback }: FeedbackDisplayProps) {
  const getScoreColorClass = (score: number) => {
    if (score >= 80) return '[&>div]:bg-accent';
    if (score >= 50) return '[&>div]:bg-primary'; // Using primary for medium scores
    return '[&>div]:bg-destructive';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-2xl">
          <Lightbulb className="h-6 w-6 text-primary" />
          AI Feedback
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
              Overall Score
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
            <h3 className="font-semibold flex items-center gap-2 text-accent-foreground">
              <CheckCircle2 className="h-5 w-5 text-accent" />
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
  );
}
