import * as React from "react"

import { cn } from "../../lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border border-muted bg-card text-card-foreground",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

export { Card } 