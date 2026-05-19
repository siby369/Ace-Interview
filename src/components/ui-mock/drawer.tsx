import * as React from "react";
import { cn } from "@/lib/utils";

export interface DrawerProps extends React.HTMLAttributes<HTMLDivElement> {}

const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("", className)} {...props} />;
});
