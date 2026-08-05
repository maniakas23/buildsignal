import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2", className)}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return child
          return React.cloneElement(child as React.ReactElement<any>, {
            className: cn(
              "border-0 focus-visible:ring-0 focus-visible:ring-offset-0",
              (child as React.ReactElement<any>).props.className
            ),
          })
        })}
      </div>
    )
  }
)
InputGroup.displayName = "InputGroup"

export { InputGroup }
