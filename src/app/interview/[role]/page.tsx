import { Header } from '@/components/header';
import { unslugify } from '@/lib/utils';
import TopicSelection from '@/components/topic-selection';

const topicsByRole: Record<string, Record<string, string[]>> = {
  'software-engineer': {
    'Data Structures': ['Arrays & Strings', 'Linked Lists', 'Trees', 'Graphs', 'Hash Tables'],
    'Algorithms': ['Sorting & Searching', 'Recursion', 'Dynamic Programming'],
    'System Design': ['Scalability', 'Databases', 'API Design'],
  },
  'product-manager': {
    'Product Strategy': ['Market Analysis', 'Roadmapping', 'Competitive Analysis'],
    'Prioritization': ['Frameworks (RICE, MoSCoW)', 'Stakeholder Management'],
    'Execution': ['Go-to-Market Strategy', 'Metrics & KPIs'],
  },
  'ux-designer': {
    'Design Process': ['User Research', 'Wireframing & Prototyping', 'Usability Testing'],
    'Collaboration': ['Working with PMs', 'Working with Engineers'],
    'Portfolio Review': ['Case Study Walkthrough', 'Design Rationale'],
  },
  'data-analyst': {
    'SQL': ['Joins', 'Window Functions', 'Subqueries'],
    'Statistics': ['Probability', 'A/B Testing', 'Regression'],
    'Data Visualization': ['Dashboard Design', 'Storytelling with Data'],
  },
};

export default function RoleTopicsPage({
  params,
}: {
  params: { role: string };
}) {
  const roleName = unslugify(params.role);
  const topics = topicsByRole[params.role] || {};
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
