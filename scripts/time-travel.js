const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Time travel dates
const START_DATE = new Date("2026-05-03T10:00:00");
const END_DATE = new Date("2026-06-21T10:00:00");

// List of realistic UI components to generate incrementally
const components = [
  'Accordion', 'Alert', 'AlertDialog', 'AspectRatio', 'Avatar', 'Badge', 'Breadcrumb', 
  'Button', 'Calendar', 'Card', 'Carousel', 'Checkbox', 'Collapsible', 'Command', 
  'ContextMenu', 'Dialog', 'Drawer', 'DropdownMenu', 'Form', 'HoverCard', 'Input', 
  'InputOTP', 'Label', 'Menubar', 'NavigationMenu', 'Pagination', 'Popover', 'Progress', 
  'RadioGroup', 'Resizable', 'ScrollArea', 'Select', 'Separator', 'Sheet', 'Skeleton', 
  'Slider', 'Sonner', 'Switch', 'Table', 'Tabs', 'Textarea', 'Toast', 'Toggle', 
  'ToggleGroup', 'Tooltip', 'Chart', 'DateRangePicker', 'TimePicker', 'ColorPicker', 'RichTextEditor',
  'CodeBlock', 'VideoPlayer', 'AudioPlayer', 'ImageGallery', 'MasonryGrid'
];

let currentDate = new Date(START_DATE);
let compIndex = 0;
let stepIndex = 0;

// Helper to execute git commands with mocked timestamps
function runGit(cmd, dateStr) {
    try {
        execSync(cmd, {
            env: {
                ...process.env,
                GIT_AUTHOR_DATE: dateStr,
                GIT_COMMITTER_DATE: dateStr,
            },
            stdio: 'ignore'
        });
    } catch (e) {
        console.error(`Error running git: ${e.message}`);
    }
}

console.log("Starting GitHub Time Travel...");

while (currentDate <= END_DATE) {
    // Generate a random number of commits for today (between 4 and 8)
    const commitsToday = Math.floor(Math.random() * 5) + 4;

    for(let i = 0; i < commitsToday; i++) {
        // If we run out of components, wrap around (though 55 * 6 = 330 commits)
        if (compIndex >= components.length) {
            compIndex = 0; 
        }

        const compName = components[compIndex];
        const dirPath = path.join(__dirname, '../src/components/ui-mock');
        const filePath = path.join(dirPath, `${compName.toLowerCase()}.tsx`);
        
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        let code = '';
        let msg = '';
        
        // Build the component piece by piece to simulate realistic development
        switch (stepIndex) {
            case 0:
                code = `import * as React from "react";\n\n`;
                msg = `feat(ui): initialize ${compName} component`;
                break;
            case 1:
                code = `import * as React from "react";\nimport { cn } from "@/lib/utils";\n\n`;
                msg = `chore(ui): add utils import to ${compName}`;
                break;
            case 2:
                code = `import * as React from "react";\nimport { cn } from "@/lib/utils";\n\nexport interface ${compName}Props extends React.HTMLAttributes<HTMLDivElement> {}\n\n`;
                msg = `feat(ui): define props interface for ${compName}`;
                break;
            case 3:
                code = `import * as React from "react";\nimport { cn } from "@/lib/utils";\n\nexport interface ${compName}Props extends React.HTMLAttributes<HTMLDivElement> {}\n\nconst ${compName} = React.forwardRef<HTMLDivElement, ${compName}Props>(({ className, ...props }, ref) => {\n  return <div ref={ref} className={cn("", className)} {...props} />;\n});\n`;
                msg = `feat(ui): implement base rendering for ${compName}`;
                break;
            case 4:
                code = `import * as React from "react";\nimport { cn } from "@/lib/utils";\n\nexport interface ${compName}Props extends React.HTMLAttributes<HTMLDivElement> {}\n\nconst ${compName} = React.forwardRef<HTMLDivElement, ${compName}Props>(({ className, ...props }, ref) => {\n  return <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;\n});\n`;
                msg = `style(ui): add tailwind classes to ${compName}`;
                break;
            case 5:
                code = `import * as React from "react";\nimport { cn } from "@/lib/utils";\n\nexport interface ${compName}Props extends React.HTMLAttributes<HTMLDivElement> {}\n\nconst ${compName} = React.forwardRef<HTMLDivElement, ${compName}Props>(({ className, ...props }, ref) => {\n  return <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;\n});\n\n${compName}.displayName = "${compName}";\n\nexport { ${compName} };\n`;
                msg = `feat(ui): export ${compName} component and add displayName`;
                break;
        }

        // Write the incrementally updated code to the file
        fs.writeFileSync(filePath, code);

        // Generate the fake timestamp for this commit
        const commitDate = new Date(currentDate);
        // Randomize the hour between 9 AM and 5 PM
        commitDate.setHours(9 + Math.floor(Math.random() * 8)); 
        // Randomize the minute
        commitDate.setMinutes(Math.floor(Math.random() * 60));
        // Add artificial seconds to prevent identical timestamps
        commitDate.setSeconds(i * 10 + Math.floor(Math.random() * 10));
        
        const dateStr = commitDate.toISOString();

        // Stage and commit with the fake timestamp
        runGit(`git add "src/components/ui-mock/${compName.toLowerCase()}.tsx"`, dateStr);
        runGit(`git commit -m "${msg}"`, dateStr);

        console.log(`[${dateStr}] Committed: ${msg}`);

        // Move to the next step or next component
        stepIndex++;
        if (stepIndex > 5) {
            stepIndex = 0;
            compIndex++;
        }
    }
    
    // Advance to the next day
    currentDate.setDate(currentDate.getDate() + 1);
}

console.log("\\nSuccess! Time travel complete! You can now run 'git push' to update your GitHub graph.");
