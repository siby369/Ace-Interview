import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.HTMLAttributes<HTMLDivElement> {}

const Button = React.forwardRef<HTMLDivElement, ButtonProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
});

Button.displayName = "Button";

export { Button };
