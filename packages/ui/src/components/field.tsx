import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"
import { Label } from "@workspace/ui/components/label"

function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  )
}

function FieldLegend({
  className,
  variant = "legend",
  ...props
}: React.ComponentProps<"legend"> & {
  variant?: "legend" | "label"
}) {
  return (
    <legend
      data-slot="field-legend"
      className={cn(
        variant === "legend"
          ? "font-mono text-xs font-semibold text-foreground uppercase tracking-wider"
          : "font-mono text-xs font-medium text-foreground",
        className
      )}
      {...props}
    />
  )
}

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn("@container/field-group flex flex-col gap-3.5", className)}
      {...props}
    />
  )
}

interface FieldProps extends React.ComponentProps<"div"> {
  orientation?: "vertical" | "horizontal" | "responsive"
  "data-invalid"?: boolean
}

function Field({
  className,
  orientation = "vertical",
  "data-invalid": dataInvalid,
  ...props
}: FieldProps) {
  return (
    <div
      data-slot="field"
      role="group"
      data-invalid={dataInvalid ? "" : undefined}
      className={cn(
        "group/field flex",
        orientation === "vertical" && "flex-col gap-1.5",
        orientation === "horizontal" && "flex-row items-center gap-2.5",
        orientation === "responsive" &&
          "flex-col gap-1.5 @[320px]/field-group:flex-row @[320px]/field-group:items-center @[320px]/field-group:gap-2.5",
        "data-[invalid]:text-destructive",
        className
      )}
      {...props}
    />
  )
}

function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      className={cn("flex flex-col gap-0.5", className)}
      {...props}
    />
  )
}

function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        "font-mono text-xs font-medium text-foreground group-data-[invalid]/field:text-destructive cursor-pointer select-none",
        className
      )}
      {...props}
    />
  )
}

function FieldTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-title"
      className={cn(
        "font-mono text-xs font-semibold text-foreground group-data-[invalid]/field:text-destructive",
        className
      )}
      {...props}
    />
  )
}

function FieldDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn("font-mono text-[10px] text-muted-foreground leading-normal", className)}
      {...props}
    />
  )
}

function FieldSeparator({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-separator"
      className={cn("relative my-2 flex items-center justify-center text-center", className)}
      {...props}
    >
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border/60" />
      </div>
      {children && (
        <span className="relative bg-background px-2 font-mono text-[10px] uppercase text-muted-foreground">
          {children}
        </span>
      )}
    </div>
  )
}

interface FieldErrorProps extends React.ComponentProps<"div"> {
  errors?: Array<{ message?: string } | string | undefined> | string
}

function FieldError({
  className,
  errors,
  children,
  ...props
}: FieldErrorProps) {
  const errorList = Array.isArray(errors)
    ? errors
        .map((e) => (typeof e === "string" ? e : e?.message))
        .filter(Boolean)
    : typeof errors === "string"
      ? [errors]
      : []

  if (!children && errorList.length === 0) {
    return null
  }

  return (
    <div
      data-slot="field-error"
      role="alert"
      className={cn(
        "font-mono text-[11px] font-medium text-destructive animate-in fade-in-50 duration-150 flex flex-col gap-0.5 mt-0.5",
        className
      )}
      {...props}
    >
      {children}
      {errorList.map((err, idx) => (
        <span key={idx} className="flex items-center gap-1">
          <span className="text-destructive/80">⚠</span>
          <span>{err}</span>
        </span>
      ))}
    </div>
  )
}

export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
}
