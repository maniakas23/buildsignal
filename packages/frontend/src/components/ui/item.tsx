import * as React from "react"
import { cn } from "@/lib/utils"

export interface ItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  start?: React.ReactNode
  end?: React.ReactNode
}

const Item = React.forwardRef<HTMLDivElement, ItemProps>(
  ({ className, children, start, end, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50 transition-colors",
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-3">
          {start && <div className="shrink-0">{start}</div>}
          <div className="flex-1 min-w-0">{children}</div>
        </div>
        {end && <div className="shrink-0">{end}</div>}
      </div>
    )
  }
)
Item.displayName = "Item"

export { Item }
