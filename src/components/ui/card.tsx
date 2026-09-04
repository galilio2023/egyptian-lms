import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "modern" | "glow" | "subtle";
}

export const Card: React.FC<CardProps> = ({
  className,
  variant = "modern",
  children,
  ...props
}) => {
  const variantStyles = {
    modern: "modern-card p-6 bg-white/95 backdrop-blur-md border-2 border-purple-100 rounded-3xl shadow-md",
    glow: "glass-glow-card p-6 bg-white/90 backdrop-blur-md border border-white/80 rounded-3xl",
    subtle: "p-4 bg-purple-50/50 border border-purple-100 rounded-2xl",
  };

  return (
    <div className={cn(variantStyles[variant], className)} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div className={cn("flex flex-col space-y-1.5", className)} {...props} />
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  ...props
}) => (
  <h3 className={cn("font-black leading-none tracking-tight text-slate-900", className)} {...props} />
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  ...props
}) => (
  <p className={cn("text-xs text-slate-500 font-medium", className)} {...props} />
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div className={cn("pt-0", className)} {...props} />
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div className={cn("flex items-center pt-4", className)} {...props} />
);
