import * as React from "react";
import { cn } from "@/lib/utils";

export interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {}

const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
});

AspectRatio.displayName = "AspectRatio";

export { AspectRatio };
