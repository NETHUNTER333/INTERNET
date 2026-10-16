import * as React from "react";
import { cn } from "@/lib/utils";

export interface PromptInputProps extends React.HTMLAttributes<HTMLDivElement> {
  onSubmit?: (value: string) => void;
}

export const PromptInput = React.forwardRef<HTMLDivElement, PromptInputProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex flex-col w-full rounded-2xl border-2.5 border-slate-900 dark:border-slate-100 bg-white dark:bg-slate-900 p-3 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#FFF] transition-all",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
PromptInput.displayName = "PromptInput";

export interface PromptInputTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onEnterSubmit?: () => void;
}

export const PromptInputTextarea = React.forwardRef<
  HTMLTextAreaElement,
  PromptInputTextareaProps
>(({ className, onKeyDown, onEnterSubmit, ...props }, ref) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (onEnterSubmit) {
        onEnterSubmit();
      } else if (props.value && typeof props.value === "string" && props.value.trim()) {
        const form = e.currentTarget.closest("form");
        if (form) form.requestSubmit();
      }
    }
    if (onKeyDown) onKeyDown(e);
  };

  return (
    <textarea
      ref={ref}
      rows={2}
      onKeyDown={handleKeyDown}
      className={cn(
        "w-full resize-none bg-transparent px-2 py-1 text-sm font-sans font-medium text-slate-900 dark:text-slate-100 outline-none placeholder:text-slate-400 focus:outline-none min-h-[48px]",
        className
      )}
      {...props}
    />
  );
});
PromptInputTextarea.displayName = "PromptInputTextarea";

export type PromptInputActionsProps = React.HTMLAttributes<HTMLDivElement>;

export const PromptInputActions = React.forwardRef<
  HTMLDivElement,
  PromptInputActionsProps
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
PromptInputActions.displayName = "PromptInputActions";

export type PromptInputActionGroupProps = React.HTMLAttributes<HTMLDivElement>;

export const PromptInputActionGroup = React.forwardRef<
  HTMLDivElement,
  PromptInputActionGroupProps
>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("flex items-center gap-1.5", className)} {...props}>
      {children}
    </div>
  );
});
PromptInputActionGroup.displayName = "PromptInputActionGroup";

export interface PromptInputActionProps
  extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  tooltip?: string | { content: string; shortcut?: string; side?: string };
}

export const PromptInputAction = React.forwardRef<
  HTMLDivElement,
  PromptInputActionProps
>(({ className, children, tooltip, ...props }, ref) => {
  const tooltipText = typeof tooltip === "string" ? tooltip : tooltip?.content;

  return (
    <div
      ref={ref}
      className={cn("relative group/action inline-flex items-center", className)}
      title={tooltipText}
      {...props}
    >
      {children}
      {tooltipText && (
        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/action:opacity-100 transition-opacity bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow whitespace-nowrap z-50">
          {tooltipText}
        </span>
      )}
    </div>
  );
});
PromptInputAction.displayName = "PromptInputAction";
