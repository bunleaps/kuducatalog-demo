import * as React from "react";
import { cn } from "../../lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(({ className, type, ...props }, ref) => <input type={type} className={cn("flex h-11 w-full rounded-sm border border-slate-300 bg-white px-4 py-2 text-sm text-slate-950 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f54449] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#414146] dark:bg-[#111113] dark:text-white dark:placeholder:text-[#77777f]", className)} ref={ref} {...props} />);
Input.displayName = "Input";
export { Input };
