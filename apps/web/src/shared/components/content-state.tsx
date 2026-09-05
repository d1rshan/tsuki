import { TriangleAlert, type LucideIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./ui/empty";

type ContentStateProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  error?: boolean;
  action?: React.ReactNode;
  className?: string;
};

export function ContentState({
  title,
  description,
  icon,
  error,
  action,
  className,
}: ContentStateProps) {
  const Icon = icon ?? (error ? TriangleAlert : undefined);

  return (
    <Empty className={className}>
      <EmptyHeader>
        {Icon ? (
          <EmptyMedia variant="icon" className={cn(error && "bg-destructive/10 text-destructive")}>
            <Icon />
          </EmptyMedia>
        ) : null}
        <EmptyTitle>{title}</EmptyTitle>
        {description ? <EmptyDescription>{description}</EmptyDescription> : null}
      </EmptyHeader>
      {action ? <EmptyContent>{action}</EmptyContent> : null}
    </Empty>
  );
}
