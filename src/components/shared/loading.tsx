import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  variant?: "default" | "card" | "inline" | "fullscreen";
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export function Loading({
  variant = "default",
  size = "md",
  text = "Đang tải...",
  className,
}: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const spinnerClass = cn("animate-spin", sizeClasses[size]);

  switch (variant) {
    case "card":
      return (
        <div
          className={cn(
            "h-64 animate-pulse bg-muted rounded-lg flex items-center justify-center",
            className
          )}
        >
          <div className="flex items-center space-x-2">
            <Loader2 className={spinnerClass} />
            <span className="text-muted-foreground">{text}</span>
          </div>
        </div>
      );

    case "inline":
      return (
        <div className={cn("flex items-center space-x-2", className)}>
          <Loader2 className={spinnerClass} />
          <span className="text-muted-foreground">{text}</span>
        </div>
      );

    case "fullscreen":
      return (
        <div
          className={cn(
            "fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50",
            className
          )}
        >
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className={cn(spinnerClass, "h-12 w-12")} />
            <p className="text-lg font-medium">{text}</p>
          </div>
        </div>
      );

    case "default":
    default:
      return (
        <div className={cn("flex items-center justify-center py-8", className)}>
          <div className="flex items-center space-x-2">
            <Loader2 className={spinnerClass} />
            <span className="text-muted-foreground">{text}</span>
          </div>
        </div>
      );
  }
}
