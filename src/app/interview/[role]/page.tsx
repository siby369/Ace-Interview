import { RoleSelectionForm } from '@/components/role-selection-form';
import { Header } from '@/components/header';
import { unslugify } from '@/lib/utils';
import DifficultySelection from '@/components/difficulty-selection';

export default function RoleDifficultyPage({
  params,
}: {
  params: { role: string };
}) {
  const roleName = unslugify(params.role);
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-4xl text-center">
          <p className="text-lg text-primary font-semibold">{roleName}</p>
          <h1 className="text-3xl font-bold font-headline tracking-tight sm:text-4xl md:text-5xl mt-2">
            Select Difficulty
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose the difficulty level for your mock interview.
          </p>
        </div>
        <DifficultySelection roleSlug={params.role} />
      </main>
    </div>
  );
}
