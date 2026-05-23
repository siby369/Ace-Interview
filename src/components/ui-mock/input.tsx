import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.HTMLAttributes<HTMLDivElement> {}

const Input = React.forwardRef<HTMLDivElement, InputProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("", className)} {...props} />;
});
