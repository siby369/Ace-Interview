import * as React from "react";
import { cn } from "@/lib/utils";

export interface LabelProps extends React.HTMLAttributes<HTMLDivElement> {}

const Label = React.forwardRef<HTMLDivElement, LabelProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("", className)} {...props} />;
});
