import * as React from "react";
import { cn } from "@/lib/utils";

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("", className)} {...props} />;
});
