import * as React from "react";
import { cn } from "@/lib/utils";

export interface HoverCardProps extends React.HTMLAttributes<HTMLDivElement> {}

const HoverCard = React.forwardRef<HTMLDivElement, HoverCardProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("", className)} {...props} />;
});
