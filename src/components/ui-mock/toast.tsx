import * as React from "react";
import { cn } from "@/lib/utils";

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("", className)} {...props} />;
});
