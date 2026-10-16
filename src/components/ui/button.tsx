import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "secondary" | "brutal";
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm";
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-bold transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer";

    const variants = {
      default:
        "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-2 border-slate-900 dark:border-slate-100 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#FFF] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0",
      outline:
        "border-2 border-slate-900 dark:border-slate-100 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#FFF]",
      ghost:
        "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-transparent",
      secondary:
        "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700",
      brutal:
        "bg-white dark:bg-slate-800 border-2.5 border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100 shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#FFF] hover:-translate-x-0.5 hover:-translate-y-0.5",
    };

    const sizes = {
      default: "h-9 px-4 py-2 text-xs rounded-xl",
      sm: "h-8 px-3 text-[11px] rounded-lg",
      lg: "h-11 px-6 text-sm rounded-xl",
      icon: "h-9 w-9 rounded-xl",
      "icon-sm": "h-8 w-8 rounded-full",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
