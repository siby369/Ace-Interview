import * as React from "react";
import { cn } from "@/lib/utils";

export interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {}

const DateRangePicker = React.forwardRef<HTMLDivElement, DateRangePickerProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
});
