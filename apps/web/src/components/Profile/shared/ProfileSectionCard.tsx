import type { ReactNode } from "react"
import { cn } from "@workspace/ui/lib/utils"

interface ProfileSectionCardProps {
  id?: string
  title: string
  description?: string
  headerAction?: ReactNode
  children: ReactNode
  className?: string
  danger?: boolean
}

export function ProfileSectionCard({
  id,
  title,
  description,
  headerAction,
  children,
  className,
  danger = false,
}: ProfileSectionCardProps) {
  return (
    <div
      id={id}
      className={cn(
        "rounded-lg border bg-card/80 backdrop-blur-sm transition-colors",
        danger
          ? "border-destructive/30"
          : "border-border",
        className
      )}
    >
      {/* Card Header */}
      <div className="flex flex-col gap-1.5 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="space-y-0.5">
          <h2
            className={cn(
              "text-sm font-semibold tracking-tight sm:text-base",
              danger ? "text-destructive" : "text-foreground"
            )}
          >
            {title}
          </h2>
          {description && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {headerAction && <div className="shrink-0 pt-1 sm:pt-0">{headerAction}</div>}
      </div>

      {/* Card Body */}
      <div className="border-t border-border/50 p-5 sm:px-6">{children}</div>
    </div>
  )
}
