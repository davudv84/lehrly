import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill text-[13.5px] font-medium tracking-[-0.005em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.985]",
  {
    variants: {
      variant: {
        default:
          "bg-brand text-primary-foreground shadow-xs hover:bg-brand-hover",
        soft:
          "bg-brand-soft text-brand-hover hover:brightness-110",
        secondary:
          "bg-surface-2 text-text-primary ring-hairline hover:bg-surface-3",
        outline:
          "ring-hairline bg-transparent text-text-primary hover:bg-surface-2",
        ghost:
          "bg-transparent text-text-secondary hover:bg-surface-2 hover:text-text-primary",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "text-brand underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-[12.5px]",
        lg: "h-12 px-6 text-[14.5px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
