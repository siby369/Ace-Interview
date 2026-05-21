import * as React from "react";
import { cn } from "@/lib/utils";

export interface FormProps extends React.HTMLAttributes<HTMLDivElement> {}

const Form = React.forwardRef<HTMLDivElement, FormProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
});

Form.displayName = "Form";

export { Form };
