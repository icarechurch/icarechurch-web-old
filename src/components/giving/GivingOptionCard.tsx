import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { cn } from "@/lib/utils";

interface GivingOptionCardProps {
  icon: ReactNode;
  iconBgColorClass: string;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}

export const GivingOptionCard = ({
  icon,
  iconBgColorClass,
  title,
  description,
  children,
  className,
}: GivingOptionCardProps) => {
  return (
    <Card className={cn("flex h-full flex-col transition-shadow duration-300 hover:shadow-lg", className)}>
      <CardHeader className="text-center">
        <div className={cn("mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full", iconBgColorClass)}>
          {icon}
        </div>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col space-y-4">
        {children}
      </CardContent>
    </Card>
  );
};
