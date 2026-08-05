import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const breadcrumbVariants = cva("flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5", {
  variants: {
    variant: {
      default: "",
      page: "font-normal text-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof breadcrumbVariants> {
  asChild?: boolean
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, variant, ...props }, ref) => (
    <nav ref={ref} aria-label="breadcrumb" className={cn(breadcrumbVariants({ variant }), className)} {...props} />
  )
)
Breadcrumb.displayName = "Breadcrumb"

const BreadcrumbList = React.forwardRef<HTMLOListElement, React.OlHTMLAttributes<HTMLOListElement>>(
  ({ className, ...props }, ref) => (
    <ol
      ref={ref}
      className={cn("flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5", className)}
      {...props}
    />
  )
)
BreadcrumbList.displayName = "BreadcrumbList"

const BreadcrumbItem = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn("inline-flex items-center gap-1.5", className)} {...props} />
  )
)
BreadcrumbItem.displayName = "BreadcrumbItem"

const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement> & { asChild?: boolean }>(
  ({ asChild, className, ...props }, ref) => {
    const Comp = asChild ? Slot : "a"
    return <Comp ref={ref} className={cn("transition-colors hover:text-foreground", className)} {...props} />
  }
)
BreadcrumbLink.displayName = "BreadcrumbLink"

const BreadcrumbPage = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span ref={ref} aria-current="page" className={cn("font-normal text-foreground", className)} {...props} />
  )
)
BreadcrumbPage.displayName = "BreadcrumbPage"

const BreadcrumbSeparator = ({ children, className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <li role="presentation" aria-hidden="true" className={cn("[&>svg]:size-3.5", className)} {...props}>
    {children || <span>/</span>}
  </li>
)
BreadcrumbSeparator.displayName = "BreadcrumbSeparator"

const BreadcrumbEllipsis = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    role="presentation"
    aria-hidden="true"
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <span className="h-1 w-1 rounded-full bg-foreground" />
    <span className="h-1 w-1 rounded-full bg-foreground mx-0.5" />
    <span className="h-1 w-1 rounded-full bg-foreground" />
  </span>
)
BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis"

export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis }
