import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-lg border border-line px-3.5 py-3 text-[15px] font-sans text-ink placeholder:text-[#9db0b0]",
          "focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-1",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
