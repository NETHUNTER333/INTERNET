import * as React from "react";
import { cn } from "@/lib/utils";

export interface SuggestionsProps extends React.HTMLAttributes<HTMLDivElement> {
  onSelect?: (value: string) => void;
}

export const Suggestions = React.forwardRef<HTMLDivElement, SuggestionsProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("w-full flex flex-col gap-2", className)} {...props}>
        {children}
      </div>
    );
  }
);
Suggestions.displayName = "Suggestions";

export interface SuggestionListProps
  extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

export const SuggestionList = React.forwardRef<
  HTMLDivElement,
  SuggestionListProps
>(({ className, orientation = "horizontal", children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-wrap items-center gap-2",
        orientation === "vertical" && "flex-col items-stretch",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SuggestionList.displayName = "SuggestionList";

export interface SuggestionProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "filled" | "ghost" | "outline";
  highlight?: string;
  value?: string;
}

export const Suggestion = React.forwardRef<HTMLButtonElement, SuggestionProps>(
  ({ className, variant = "outline", children, onClick, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        onClick={(e) => {
          if (onClick) onClick(e);
        }}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-extrabold uppercase transition-all duration-100 cursor-pointer border-2 border-slate-900 dark:border-slate-100 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#FFF] active:translate-x-0 active:translate-y-0",
          variant === "filled" &&
            "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:-translate-x-0.5 hover:-translate-y-0.5",
          variant === "outline" &&
            "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800",
          variant === "ghost" &&
            "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-none shadow-none hover:bg-slate-200 dark:hover:bg-slate-700",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Suggestion.displayName = "Suggestion";

export interface SuggestionPanelProps
  extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
}

export const SuggestionPanel = React.forwardRef<
  HTMLDivElement,
  SuggestionPanelProps
>(({ className, open, children, ...props }, ref) => {
  if (!open) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "absolute top-full left-0 right-0 mt-2 z-30 flex flex-col rounded-2xl border-2.5 border-slate-900 dark:border-slate-100 bg-white dark:bg-slate-900 p-4 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#FFF] animate-in fade-in duration-150",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SuggestionPanel.displayName = "SuggestionPanel";

export const SuggestionPanelHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between pb-2 mb-2 border-b-2 border-slate-900/10 dark:border-slate-100/10",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SuggestionPanelHeader.displayName = "SuggestionPanelHeader";

export const SuggestionPanelTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-2 font-sketch font-black text-sm uppercase text-slate-900 dark:text-slate-100",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SuggestionPanelTitle.displayName = "SuggestionPanelTitle";

export const SuggestionPanelClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, onClick, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={cn(
        "p-1 rounded-lg border border-slate-900 dark:border-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
SuggestionPanelClose.displayName = "SuggestionPanelClose";

export const SuggestionPanelContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("flex flex-col gap-2 pt-1", className)} {...props}>
      {children}
    </div>
  );
});
SuggestionPanelContent.displayName = "SuggestionPanelContent";
