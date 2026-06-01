import * as React from "react";
import { cn } from "@/lib/utils";

export interface ResizableProps extends React.HTMLAttributes<HTMLDivElement> {}

const Resizable = React.forwardRef<HTMLDivElement, ResizableProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("", className)} {...props} />;
});
