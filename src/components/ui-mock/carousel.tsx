import * as React from "react";
import { cn } from "@/lib/utils";

export interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {}

const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
});

Carousel.displayName = "Carousel";

export { Carousel };
