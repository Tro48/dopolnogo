import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "danger";

const variants: Record<Variant, string> = {
  primary: "bg-button text-on-button hover:opacity-90",
  secondary: "bg-surface text-text hover:opacity-80",
  danger: "bg-danger text-white hover:opacity-90",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
};

export function Button({ variant = "primary", className, children, ...rest }: Props) {
  return (
    <button
      className={cn(
        "rounded-base inline-flex min-h-11 items-center justify-center px-5 text-base font-medium transition-opacity disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
