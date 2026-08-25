"use client"

import {
  useMotionValueEvent,
  useScroll,
  useTransform,
  motion,
} from "framer-motion"
import React, { useEffect, useRef, useState } from "react"
import { cn } from "@workspace/ui/lib/utils"

export interface TimelineEntry {
  title: string
  content: React.ReactNode
}

export interface TimelineProps {
  data: TimelineEntry[]
  title?: string
  description?: string
  className?: string
}

export const Timeline = ({
  data,
  title = "Changelog from my journey",
  description = "Here is a breakdown of my engineering journey and milestones.",
  className,
}: TimelineProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      setHeight(rect.height)
    }
  }, [ref, data])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  })

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height])
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1])

  return (
    <div
      className={cn("w-full bg-background font-sans md:px-10", className)}
      ref={containerRef}
    >
      {(title || description) && (
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 lg:px-10">
          {title && (
            <h2 className="mb-4 max-w-4xl text-2xl font-bold tracking-tight text-foreground md:text-4xl">
              {title}
            </h2>
          )}
          {description && (
            <p className="max-w-xl text-sm text-muted-foreground md:text-base">
              {description}
            </p>
          )}
        </div>
      )}

      <div ref={ref} className="relative mx-auto max-w-7xl pb-20">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex justify-start pt-10 md:gap-10 md:pt-28"
          >
            <div className="sticky top-40 z-40 flex max-w-xs self-start items-center md:w-full md:flex-row lg:max-w-sm">
              <div className="absolute left-3 flex size-10 items-center justify-center rounded-full border border-border bg-background shadow-xs md:left-3">
                <div className="size-3.5 rounded-full border border-primary/40 bg-primary/20 shadow-[0_0_8px_oklch(var(--primary)/50%)]" />
              </div>
              <h3 className="hidden font-mono text-xl font-bold tracking-tight text-muted-foreground/80 md:block md:pl-20 md:text-3xl lg:text-4xl">
                {item.title}
              </h3>
            </div>

            <div className="relative w-full pr-4 pl-20 md:pl-4">
              <h3 className="mb-4 block text-left font-mono text-xl font-bold text-foreground md:hidden">
                {item.title}
              </h3>
              {item.content}
            </div>
          </div>
        ))}

        <div
          style={{
            height: `${height}px`,
          }}
          className="absolute top-0 left-8 w-[2px] overflow-hidden bg-gradient-to-b from-transparent via-border to-transparent [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] md:left-8"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-[2px] rounded-full bg-gradient-to-t from-primary via-primary/80 to-transparent"
          />
        </div>
      </div>
    </div>
  )
}
