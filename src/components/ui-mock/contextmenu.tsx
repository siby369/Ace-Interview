import * as React from "react";
import { cn } from "@/lib/utils";

export interface ContextMenuProps extends React.HTMLAttributes<HTMLDivElement> {}

const ContextMenu = React.forwardRef<HTMLDivElement, ContextMenuProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("", className)} {...props} />;
});
