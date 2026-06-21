import { Metadata } from 'next';
import HowItWorksContent from './how-it-works-content';

export const metadata: Metadata = {
  title: 'How It Works | Ace Interview',
  description: 'Understand the journey from configuring your dream role to mastering the interview with AI feedback.',
};

export default function HowItWorksPage() {
  return <HowItWorksContent />;
}
