import * as React from "react";
import { cn } from "@/lib/utils";

export interface SheetProps extends React.HTMLAttributes<HTMLDivElement> {}

const Sheet = React.forwardRef<HTMLDivElement, SheetProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
});

Sheet.displayName = "Sheet";

export { Sheet };
