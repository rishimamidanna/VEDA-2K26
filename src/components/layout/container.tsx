import React from "react";
import { cn } from "@/lib/utils";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const sizeClasses: Record<NonNullable<ContainerProps["size"]>, string> = {
  sm: "max-w-3xl", // ~768px - focused / reading
  md: "max-w-5xl", // ~1024px - tablet & compact views
  lg: "max-w-6xl", // ~1152px - laptop standard
  xl: "max-w-7xl", // ~1280px - desktop wide
  full: "max-w-full",
};

/**
 * Responsive layout container component with Apple-inspired generous padding
 * and responsive max-widths across mobile, tablet, laptop, and desktop.
 */
export function Container({
  as: Component = "div",
  size = "xl",
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <Component
      className={cn(
        "w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-12",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
