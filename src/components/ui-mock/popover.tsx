import * as React from "react";
import { cn } from "@/lib/utils";

export interface PopoverProps extends React.HTMLAttributes<HTMLDivElement> {}

const Popover = React.forwardRef<HTMLDivElement, PopoverProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
});
