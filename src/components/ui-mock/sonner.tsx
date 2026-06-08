import * as React from "react";
import { cn } from "@/lib/utils";

export interface SonnerProps extends React.HTMLAttributes<HTMLDivElement> {}

const Sonner = React.forwardRef<HTMLDivElement, SonnerProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("", className)} {...props} />;
});
