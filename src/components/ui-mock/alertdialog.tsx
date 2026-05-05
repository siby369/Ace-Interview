import * as React from "react";
import { cn } from "@/lib/utils";

export interface AlertDialogProps extends React.HTMLAttributes<HTMLDivElement> {}

const AlertDialog = React.forwardRef<HTMLDivElement, AlertDialogProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
});

AlertDialog.displayName = "AlertDialog";

export { AlertDialog };
