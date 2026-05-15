import * as React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends React.HTMLAttributes<HTMLDivElement> {}

const Checkbox = React.forwardRef<HTMLDivElement, CheckboxProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("", className)} {...props} />;
});
