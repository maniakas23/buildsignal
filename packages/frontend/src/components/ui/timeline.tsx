import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

export interface TimelineItemData {
  id: string;
  title: string;
  description?: string;
  date?: string;
  status?: "completed" | "in-progress" | "pending" | "failed";
}

interface TimelineProps {
  items?: TimelineItemData[];
  className?: string;
  children?: ReactNode;
}

export function Timeline({ items, className, children }: TimelineProps) {
  if (items) {
    return (
      <div className={cn("space-y-4", className)}>
        {items.map((item, index) => (
          <div key={item.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-2.5 h-2.5 rounded-full",
                item.status === "completed" && "bg-accent-teal",
                item.status === "in-progress" && "bg-accent-amber",
                item.status === "failed" && "bg-accent-crimson",
                (!item.status || item.status === "pending") && "bg-ink-tertiary/50"
              )} />
              {index < items.length - 1 && (
                <div className="w-px h-full min-h-[24px] bg-ink-wash mt-1" />
              )}
            </div>
            <div className="pb-4">
              <p className="text-sm font-medium text-ink-primary">{item.title}</p>
              {item.description && (
                <p className="text-xs text-ink-secondary mt-0.5">{item.description}</p>
              )}
              {item.date && (
                <p className="text-[10px] text-ink-tertiary mt-1">{item.date}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <div className={cn("space-y-4", className)}>{children}</div>;
}

interface TimelineItemProps {
  date?: string;
  title?: string;
  description?: string;
  status?: "completed" | "current" | "pending" | "in-progress" | "failed";
}

export function TimelineItem({ date, title, description, status }: TimelineItemProps) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={cn(
          "w-2.5 h-2.5 rounded-full",
          status === "completed" && "bg-accent-teal",
          status === "current" && "bg-accent-amber",
          status === "in-progress" && "bg-accent-amber",
          status === "failed" && "bg-accent-crimson",
          (!status || status === "pending") && "bg-ink-tertiary/50"
        )} />
        <div className="w-px h-full min-h-[24px] bg-ink-wash mt-1" />
      </div>
      <div className="pb-4">
        {title && <p className="text-sm font-medium text-ink-primary">{title}</p>}
        {description && <p className="text-xs text-ink-secondary mt-0.5">{description}</p>}
        {date && <p className="text-[10px] text-ink-tertiary mt-1">{date}</p>}
      </div>
    </div>
  );
}
