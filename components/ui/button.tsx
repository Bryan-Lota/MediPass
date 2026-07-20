import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "dark" | "outline" | "ghost" | "danger" | "warning";
type ButtonSize = "default" | "sm";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-teal-600 text-white hover:bg-teal-700 disabled:bg-teal-200",
  dark: "bg-ink text-white hover:bg-ink-deep",
  outline: "border border-line bg-white text-ink hover:border-teal-600 hover:text-teal-700",
  ghost: "bg-transparent text-ink hover:bg-teal-50",
  danger: "bg-danger-bg text-danger-text border border-danger-border hover:brightness-95",
  warning: "bg-amber-bg text-amber-text border border-amber-border hover:brightness-95",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "text-sm px-5 py-3",
  sm: "text-xs px-3.5 py-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
