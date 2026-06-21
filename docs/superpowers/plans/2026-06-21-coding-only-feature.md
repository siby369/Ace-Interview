# Interview Settings: Difficulty & Coding Only Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a user-selectable Difficulty Level and a "Coding Only" Practice Mode to the interview setup flow, enforcing that "Coding Only" or "Hard" modes prioritize generating code-typing tasks.

**Architecture:** We will add pill selectors for Difficulty and Practice Mode in the setup UI (`new/page.tsx`). These settings will be passed as query parameters to `start/page.tsx`, which filters them from the topics list and feeds them into `InterviewClientView`. The AI generation flows will take the new `codingOnly` flag and use prompt engineering to enforce coding constraints when `codingOnly=true` or difficulty is Hard.

**Tech Stack:** Next.js (App Router), React, Tailwind CSS, Zod, Groq (AI).

---

### Task 1: Update AI Generation Schemas & Prompts

**Files:**
- Modify: `src/ai/flows/generate-single-question.ts`
- Modify: `src/ai/flows/generate-panel-question.ts`

- [ ] **Step 1: Update `generate-single-question.ts` schema and prompt**
Modify `GenerateSingleInterviewQuestionInputSchema` to accept `codingOnly`:
```typescript
  codingOnly: z.boolean().optional().describe('If true, force the question to be a strict coding/implementation task.'),
```
Extract `codingOnly` in the parse step, and update the prompt logic:
```typescript
  const codingOnlyString = codingOnly ? `\nCRITICAL REQUIREMENT: The user has selected "Coding Only" mode. You MUST generate a programming, algorithm, or coding implementation task appropriate for the role (e.g., scripting for SWE, SQL for Data Analysts, HTML/CSS for UX). You MUST set requiresTyping to true.` : '';
```
Modify the "Hard" difficulty instruction inside the prompt string:
```typescript
- If the difficulty is "Hard", ask a complex scenario-based or design/coding question. For technical roles, ensure you include coding tasks requiring the user to write code (setting requiresTyping to true).
```
Inject `${codingOnlyString}` into the prompt string.

- [ ] **Step 2: Update `generate-panel-question.ts` schema and prompt**
Modify `GeneratePanelQuestionInputSchema` to accept `codingOnly`:
```typescript
  codingOnly: z.boolean().optional().describe('If true, force the question to be a strict coding/implementation task.'),
```
Extract it, and add a similar prompt constraint:
```typescript
  const codingOnlyString = codingOnly ? `\nCRITICAL REQUIREMENT: The user has selected "Coding Only" mode. Regardless of your persona, you MUST generate a programming, algorithmic, or coding implementation task appropriate for the candidate's role. You MUST set requiresTyping to true.` : '';
```
Inject `${codingOnlyString}` into the prompt.

- [ ] **Step 3: Commit Task 1**
```bash
git add src/ai/flows/generate-single-question.ts src/ai/flows/generate-panel-question.ts
git commit -m "feat(ai): add codingOnly flag and update difficulty prompts to enforce coding tasks"
```

### Task 2: Pass Parameters through `start/page.tsx`

**Files:**
- Modify: `src/app/interview/start/page.tsx`

- [ ] **Step 1: Extract and filter new query parameters**
In `InterviewStartContent`, extract `difficulty` and `codingOnly`:
```typescript
  const codingOnly = searchParams.get('codingOnly') === 'true';
```
Update the `forEach` filter to exclude the new keys:
```typescript
    if(key !== 'role' && key !== 'questionCount' && key !== 'company' && key !== 'persona' && key !== 'jdContext' && key !== 'jd' && key !== 'codingOnly' && key !== 'difficulty') {
      topics[key] = value;
    }
```

- [ ] **Step 2: Pass `codingOnly` to `InterviewClientView`**
Add the prop:
```typescript
      <InterviewClientView
        initialInterviewData={{ questions: [] as GenerateSingleInterviewQuestionOutput[] }}
        role={roleName}
        company={company}
        persona={persona as any}
        topics={topics}
        targetQuestionCount={questionCount}
        jdContext={jdContext ?? undefined}
        rawJD={rawJD}
        codingOnly={codingOnly}
      />
```

- [ ] **Step 3: Commit Task 2**
```bash
git add src/app/interview/start/page.tsx
git commit -m "feat(interview): extract and pass codingOnly parameter from URL to client view"
```

### Task 3: Propagate `codingOnly` in `InterviewClientView`

**Files:**
- Modify: `src/components/interview-client-view.tsx`

- [ ] **Step 1: Update `InterviewClientViewProps`**
Add the new properties:
```typescript
  codingOnly?: boolean;
```
Add to the component destructured props: `codingOnly = false`.

- [ ] **Step 2: Pass `codingOnly` to AI calls**
In the initial fetch and background prefetch loops, update the calls to `generatePanelQuestion` and `generateSingleInterviewQuestion`:
```typescript
          firstQuestion = await generatePanelQuestion({
            persona: panel[0],
            jobRole: role,
            previousQuestions: [],
            jdContext,
            companyName: company,
            rawJD,
            codingOnly,
          });
// ... and ...
          firstQuestion = await generateSingleInterviewQuestion({
            role: `${role} (${persona})`,
            topics: adaptiveTopics,
            previousQuestions: [],
            jdContext,
            companyName: company,
            rawJD,
            codingOnly,
          });
```
Do the same for the `questionPromise` assignments in the background generation effect (around line 185).

- [ ] **Step 3: Commit Task 3**
```bash
git add src/components/interview-client-view.tsx
git commit -m "feat(interview): propagate codingOnly flag to AI question generators"
```

### Task 4: Add Difficulty & Practice Mode Selectors to Setup UI

**Files:**
- Modify: `src/app/interview/new/page.tsx`

- [ ] **Step 1: Add State Variables**
```typescript
  const [difficulty, setDifficulty] = useState('Medium');
  const [practiceMode, setPracticeMode] = useState<'Standard' | 'Coding Only'>('Standard');
```

- [ ] **Step 2: Add Difficulty Selector UI**
Insert a new difficulty block before AI Persona (where setupMode check uses numbers for headers):
```tsx
          {/* Difficulty */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}>
            <h2 className="text-sm font-medium tracking-widest uppercase text-[#E1E0CC]/40 mb-6">Difficulty</h2>
            <div className="flex flex-wrap gap-3 mb-6">
              {['Easy', 'Medium', 'Hard'].map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-colors border ${
                    difficulty === d
                      ? 'bg-[#E1E0CC] text-black border-[#E1E0CC]' 
                      : 'bg-white/[0.02] text-[#E1E0CC]/70 border-white/10 hover:bg-white/[0.05] hover:text-[#E1E0CC]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </motion.div>
```

- [ ] **Step 3: Add Practice Mode Selector UI**
Insert a new Practice Mode block (right after Difficulty):
```tsx
          {/* Practice Mode */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}>
            <h2 className="text-sm font-medium tracking-widest uppercase text-[#E1E0CC]/40 mb-6">Practice Mode</h2>
            <div className="flex flex-wrap gap-3 mb-6">
              {['Standard', 'Coding Only'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setPracticeMode(mode as any)}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-colors border ${
                    practiceMode === mode
                      ? 'bg-[#E1E0CC] text-black border-[#E1E0CC]' 
                      : 'bg-white/[0.02] text-[#E1E0CC]/70 border-white/10 hover:bg-white/[0.05] hover:text-[#E1E0CC]'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </motion.div>
```
Remember to update the step numbering for AI Persona and Question Count (from 3/4 to 5/6 and 6/7) depending on `setupMode`.

- [ ] **Step 4: Propagate in `handleStart`**
Update `handleStart` to map the `difficulty` state to the `topics` values:
```typescript
      availableTopics.forEach(t => {
        if (isSelected(t)) {
          searchParams.set(t.toLowerCase().replace(/\s+/g, '-'), difficulty);
        }
      });
      customTopics.forEach(t => {
        if (isSelected(t)) {
          searchParams.set(t.toLowerCase().replace(/\s+/g, '-'), difficulty);
        }
      });
```
And for JD mode:
```typescript
      extractedTopics.forEach(t => {
        if (selectedJdTopics[t] !== false) {
          searchParams.set(t.toLowerCase().replace(/\s+/g, '-'), difficulty);
        }
      });
```
Add the `codingOnly` parameter globally:
```typescript
    if (practiceMode === 'Coding Only') {
      searchParams.set('codingOnly', 'true');
    }
```

- [ ] **Step 5: Verify Build & Commit**
```bash
npm run build
git add src/app/interview/new/page.tsx
git commit -m "feat(ui): add difficulty and practice mode selectors to interview setup"
```
