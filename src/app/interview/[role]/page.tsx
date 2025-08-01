import { Header } from '@/components/header';
import { unslugify } from '@/lib/utils';
import TopicSelection from '@/components/topic-selection';

const topicsByRole: Record<string, Record<string, string[]>> = {
  'software-engineer': {
    'Data Structures': [
      'Arrays & Strings',
      'Linked Lists',
      'Stacks & Queues',
      'Heaps / Priority Queues',
      'Trees (Binary, BST, Trie)',
      'Graphs (BFS, DFS, Dijkstra)',
      'Hash Maps / Hash Sets',
    ],
    'Algorithms': [
      'Sliding Window Technique',
      'Two Pointer Technique',
      'Recursion & Backtracking',
      'Dynamic Programming',
      'Greedy Algorithms',
      'Bit Manipulation',
      'Time and Space Complexity',
    ],
    'System Design': [
      'Low-Level Design (OOD)',
      'High-Level Design',
      'RESTful API Design',
      'Caching Strategies',
      'Load Balancing',
      'Scalability (Horizontal vs Vertical)',
      'Microservices vs Monolithic',
      'CAP Theorem',
      'Message Queues (Kafka, RabbitMQ)',
    ],
    'Databases': [
      'SQL Queries (Joins, Aggregates)',
      'Database Design (Schema, ER Models)',
      'Indexing and Query Optimization',
      'Transactions and ACID Properties',
      'NoSQL Databases',
    ],
    'Operating Systems & Networking': [
      'Processes vs Threads',
      'Deadlocks and Race Conditions',
      'Memory Management (Stack vs Heap)',
      'Networking Basics (TCP/IP, OSI Model)',
      'HTTP, HTTPS, and WebSockets',
    ],
    'Security': [
      'Authentication vs Authorization (OAuth, JWT)',
      'Hashing and Encryption',
      'Common Vulnerabilities (SQL Injection, XSS)',
    ],
    'Software Development Lifecycle': [
      'Git and Version Control',
      'CI/CD Basics',
      'Docker and Containerization',
      'Agile Methodologies',
    ],
    'Behavioral': [
      'STAR Method',
      'Teamwork and Conflict Resolution',
      'Motivation and Career Goals',
    ],
  },
  'product-manager': {
    'Product Sense & Design': [
      'User Research & Customer Empathy',
      'Problem Identification & Framing',
      'Market Research & Competitor Analysis',
      'Product Lifecycle Management',
      'Defining & Prioritizing Features',
      'Feature Trade-offs (Impact vs Effort)',
      'Usability & UX Principles',
      'Design Thinking Process',
      'Wireframing & Prototyping',
      'Accessibility & Inclusive Design',
      'Building 0 to 1 Products',
      'Scaling Products 1 to 100',
    ],
    'Strategy & Roadmapping': [
      'Roadmapping & Strategic Planning',
      'Writing Product Requirements Documents (PRD)',
      'Product Launch Planning',
      'Go-to-Market (GTM) Strategy',
      'Competitive Differentiation',
      'SWOT Analysis',
      'Product-Market Fit',
      'Vision vs Execution Tradeoffs',
      'Product Strategy Alignment',
      'Growth vs Core Product Strategy',
      'Backward Roadmapping',
      'Product Vision Creation',
    ],
    'Execution & Agile': [
      'Agile Methodology (Scrum vs Kanban)',
      'Writing User Stories',
      'Sprint Planning & Backlog Grooming',
      'Customer Feedback Loops',
      'Incident Handling / Crisis Response',
      'Product Sunsetting',
      'PM Tools (Jira, Confluence, etc.)',
    ],
    'Data & Metrics': [
      'Metrics & KPIs (North Star, Retention)',
      'A/B Testing and Experimentation',
      'Funnel Analysis & Conversion Optimization',
      'Prioritization Frameworks (RICE, MoSCoW)',
      'OKRs and Goal Setting',
      'Product Analytics Tools',
      'SQL for Product Managers',
      'Data Interpretation & Decision-Making',
      'Estimation Questions',
      'Metrics Questions',
    ],
    'Technical Acumen': [
      'Technical Concepts (APIs, Cloud)',
      'Understanding Engineering Constraints',
      'Mobile vs Web Product Differences',
      'AI/ML Product Basics',
      'Managing Product Debt',
      'Build vs Buy vs Partner Trade-offs',
    ],
    'Business & Growth': [
      'Growth Hacking Techniques',
      'Retention & Engagement Strategies',
      'Monetization & Pricing Models',
      'Business Model Canvas',
      'Market Sizing (TAM/SAM/SOM)',
      'Revenue & Cost Projections',
    ],
    'Leadership & Communication': [
      'Stakeholder Management',
      'Cross-functional Collaboration',
      'Communication & Presentation Skills',
      'Vision & Strategy Communication',
      'Managing Up & Influence',
      'Leading Through Ambiguity',
      'Conflict Resolution',
    ],
    'Behavioral & Interviewing': [
      'Behavioral Questions (STAR Method)',
      'Handling Difficult Feedback',
      'Time Management & Prioritization',
      'Handling Failure',
      'PM Interview Frameworks (CIRCLES, AARM)',
      'Whiteboard Design Questions',
      'Career Motivation & Role Fit',
    ],
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
