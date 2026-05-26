import * as React from "react";
import { cn } from "@/lib/utils";

export interface MenubarProps extends React.HTMLAttributes<HTMLDivElement> {}

const Menubar = React.forwardRef<HTMLDivElement, MenubarProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("", className)} {...props} />;
});
