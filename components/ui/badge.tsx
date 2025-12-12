import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variant === "default" && "bg-blue-600 text-white",
        variant === "secondary" && "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
        variant === "destructive" && "bg-red-600 text-white",
        className
      )}
      {...props}
    />
  );
}
