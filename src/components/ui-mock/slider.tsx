import * as React from "react";
import { cn } from "@/lib/utils";

export interface SliderProps extends React.HTMLAttributes<HTMLDivElement> {}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
});
