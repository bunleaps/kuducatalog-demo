import * as React from "react";
import { cn } from "../../lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(({ className, ...props }, ref) => <textarea className={cn("flex min-h-[120px] w-full rounded-sm border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f54449] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#414146] dark:bg-[#111113] dark:text-white dark:placeholder:text-[#77777f]", className)} ref={ref} {...props} />);
Textarea.displayName = "Textarea";
export { Textarea };
