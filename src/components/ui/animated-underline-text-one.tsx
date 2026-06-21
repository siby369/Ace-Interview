"use client";

import * as React from "react";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedTextProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string;
  textClassName?: string;
  underlineClassName?: string;
  underlinePath?: string;
  underlineHoverPath?: string;
  underlineDuration?: number;
}

const AnimatedText = React.forwardRef<HTMLDivElement, AnimatedTextProps>(
  (
    {
      text,
      textClassName,
      underlineClassName,
      underlinePath = "M 0,10 Q 75,0 150,10 Q 225,20 300,10",
      underlineHoverPath = "M 0,10 Q 75,20 150,10 Q 225,0 300,10",
      underlineDuration = 1.5,
      ...props
    },
    ref
  ) => {
    const pathVariants: Variants = {
      hidden: {
        pathLength: 0,
        opacity: 0,
      },
      visible: {
        pathLength: 1,
        opacity: 1,
        transition: {
          duration: underlineDuration,
          ease: "easeInOut",
        },
      },
    };

    return (
      <motion.div
        ref={ref}
        className={cn("flex flex-col items-center justify-center gap-2", props.className)}
        initial="hidden"
        animate="hidden"
        whileHover="hover"
      >
        <div className="relative w-full">
          <motion.h1
            className={cn("text-4xl font-bold text-center", textClassName)}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            variants={{
              hover: { scale: 1.02 }
            }}
          >
            {text}
          </motion.h1>

          <motion.svg
            width="100%"
            height="12"
            viewBox="0 0 300 20"
            preserveAspectRatio="none"
            className={cn("absolute top-[85%] left-0 pointer-events-none", underlineClassName)}
          >
            <motion.path
              d={underlinePath}
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              variants={{
                ...pathVariants,
                hover: {
                  pathLength: 1,
                  opacity: 1,
                  d: underlineHoverPath,
                  transition: { duration: 0.4, ease: "easeInOut" },
                }
              }}
            />
          </motion.svg>
        </div>
      </motion.div>
    );
  }
);

AnimatedText.displayName = "AnimatedText";

export { AnimatedText };
