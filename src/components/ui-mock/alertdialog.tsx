import * as React from "react";
import { cn } from "@/lib/utils";

export interface AlertDialogProps extends React.HTMLAttributes<HTMLDivElement> {}

const AlertDialog = React.forwardRef<HTMLDivElement, AlertDialogProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("", className)} {...props} />;
});
