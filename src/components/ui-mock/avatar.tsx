import * as React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("", className)} {...props} />;
});
