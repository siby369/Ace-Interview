import * as React from "react";
import { cn } from "@/lib/utils";

export interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {}

const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("", className)} {...props} />;
});
