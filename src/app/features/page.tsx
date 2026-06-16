import { Metadata } from 'next';
import FeaturesContent from './features-content';

export const metadata: Metadata = {
  title: 'Features | Ace Interview',
  description: 'Explore the powerful features of Ace Interview, including AI-powered feedback, role-based practice, and more.',
};

export default function FeaturesPage() {
  return <FeaturesContent />;
}
