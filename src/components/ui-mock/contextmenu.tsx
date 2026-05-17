import * as React from "react";
import { cn } from "@/lib/utils";

export interface ContextMenuProps extends React.HTMLAttributes<HTMLDivElement> {}

const ContextMenu = React.forwardRef<HTMLDivElement, ContextMenuProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
});

ContextMenu.displayName = "ContextMenu";

export { ContextMenu };
