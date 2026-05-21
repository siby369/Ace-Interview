import * as React from "react";
import { cn } from "@/lib/utils";

export interface FormProps extends React.HTMLAttributes<HTMLDivElement> {}

const Form = React.forwardRef<HTMLDivElement, FormProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("", className)} {...props} />;
});
