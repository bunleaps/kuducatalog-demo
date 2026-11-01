import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-bold uppercase tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f54449] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#101010] disabled:pointer-events-none disabled:opacity-50", {
  variants: { variant: { default: "bg-[#f54449] text-white shadow-sm hover:bg-[#ff565b]", outline: "border border-slate-300 bg-transparent text-slate-950 hover:bg-slate-100 dark:border-[#3a3a3d] dark:text-white dark:hover:bg-[#242427]", ghost: "text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-[#a7a7ad] dark:hover:bg-[#242427] dark:hover:text-white", destructive: "bg-red-600 text-white hover:bg-red-500" }, size: { default: "h-11 px-5 py-2", sm: "h-9 px-3", lg: "h-13 px-8" } },
  defaultVariants: { variant: "default", size: "default" },
});

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { asChild?: boolean; }
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = "Button";
export { Button, buttonVariants };
