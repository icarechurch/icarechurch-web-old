import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({
  className,
  size = "md",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <Loader2
      className={cn(
        "animate-spin text-muted-foreground",
        sizeClasses[size],
        className
      )}
    />
  );
}

interface LoadingScreenProps {
  children?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

export function LoadingScreen({
  children,
  className,
  size = "md",
  fullScreen = false,
}: LoadingScreenProps) {
  const containerClasses = fullScreen
    ? "min-h-screen flex items-center justify-center"
    : "flex items-center justify-center py-12";

  return (
    <div className={cn(containerClasses, className)}>
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner size={size} />
        {children || <p className="text-muted-foreground">Loading...</p>}
      </div>
    </div>
  );
}
