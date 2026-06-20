import type { ReactNode } from "react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

type EmptyStateProps = {
  illustration?: ReactNode;
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  illustration,
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Empty className={className}>
      <EmptyHeader>
        {illustration ? (
          <EmptyMedia>{illustration}</EmptyMedia>
        ) : icon ? (
          <EmptyMedia variant="icon">{icon}</EmptyMedia>
        ) : null}
        <EmptyTitle>{title}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      {action && <div className="mt-2">{action}</div>}
    </Empty>
  );
}
