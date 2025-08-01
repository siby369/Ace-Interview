import { Header } from '@/components/header';
import { unslugify } from '@/lib/utils';
import TopicSelection from '@/components/topic-selection';

const topicsByRole: Record<string, string[]> = {
  'software-engineer': ['Data Structures', 'Algorithms', 'System Design'],
  'product-manager': ['Product Strategy', 'Prioritization', 'Execution'],
  'ux-designer': ['Design Process', 'Collaboration', 'Portfolio Review'],
  'data-analyst': ['SQL', 'Statistics', 'Data Visualization'],
};

export default function RoleTopicsPage({
  params,
}: {
  params: { role: string };
}) {
  const roleName = unslugify(params.role);
  const topics = topicsByRole[params.role] || [];
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-4xl text-center">
          <p className="text-lg text-primary font-semibold">{roleName}</p>
          <h1 className="text-3xl font-bold font-headline tracking-tight sm:text-4xl md:text-5xl mt-2">
            Customize Your Interview
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Select the topics and their difficulty for your mock interview.
          </p>
        </div>
        <TopicSelection roleSlug={params.role} roleName={roleName} topics={topics} />
      </main>
    </div>
  );
}
