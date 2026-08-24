"use client"

import React, { useEffect, useRef } from "react"

interface TextScrambleProps {
  texts: string[]
  speed?: number
  scrambleSpeed?: number
  className?: string
}

export function TextScramble({
  texts,
  speed = 3000,
  scrambleSpeed = 50,
  className = "",
}: TextScrambleProps) {
  const textRef = useRef<HTMLSpanElement>(null)
  const indexRef = useRef(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  const characters = "!<>-_\\/[]{}—=+*^?#________________________________________"

  useEffect(() => {
    let isMounted = true

    const clearTimers = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = undefined
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = undefined
      }
    }

    const scramble = (targetText: string) => {
      clearTimers()
      let iteration = 0
      const maxIteration = targetText.length

      intervalRef.current = setInterval(() => {
        if (!isMounted || !textRef.current) return

        textRef.current.textContent = targetText
          .split("")
          .map((char, index) => {
            if (index < iteration) {
              return targetText[index]
            }
            return characters[Math.floor(Math.random() * characters.length)]
          })
          .join("")

        if (iteration >= maxIteration) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = undefined
          }
        }
        iteration += 1 / 3
      }, scrambleSpeed)
    }

    const cycle = () => {
      if (!isMounted) return
      const targetText = texts[indexRef.current % texts.length]
      scramble(targetText)

      timeoutRef.current = setTimeout(() => {
        if (!isMounted) return
        indexRef.current += 1
        cycle()
      }, speed)
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearTimers()
      } else {
        cycle()
      }
    }

    cycle()
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      isMounted = false
      clearTimers()
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [texts, speed, scrambleSpeed])

  return (
    <span
      ref={textRef}
      className={`inline-block font-mono select-none ${className}`}
    />
  )
}

