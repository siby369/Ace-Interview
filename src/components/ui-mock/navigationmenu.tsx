import * as React from "react";
import { cn } from "@/lib/utils";

export interface NavigationMenuProps extends React.HTMLAttributes<HTMLDivElement> {}

const NavigationMenu = React.forwardRef<HTMLDivElement, NavigationMenuProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
});

NavigationMenu.displayName = "NavigationMenu";

export { NavigationMenu };
