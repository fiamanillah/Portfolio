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
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )

  const characters =
    "!<>-_\\/[]{}—=+*^?#________________________________________"

  const scramble = (targetText: string) => {
    let iteration = 0
    const maxIteration = targetText.length
    const interval = setInterval(() => {
      if (!textRef.current) return

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
        clearInterval(interval)
      }
      iteration += 1 / 3
    }, scrambleSpeed)

    return () => clearInterval(interval)
  }

  const cycle = () => {
    const targetText = texts[indexRef.current % texts.length]
    scramble(targetText)

    timeoutRef.current = setTimeout(() => {
      indexRef.current += 1
      cycle()
    }, speed)
  }

  useEffect(() => {
    cycle()

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [texts, speed])

  return <span ref={textRef} className={className} />
}
