import * as React from "react";
import { cn } from "@/lib/utils";

export interface ToggleProps extends React.HTMLAttributes<HTMLDivElement> {}

const Toggle = React.forwardRef<HTMLDivElement, ToggleProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("", className)} {...props} />;
});
