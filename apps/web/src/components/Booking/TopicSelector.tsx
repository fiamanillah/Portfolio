// ── TopicSelector.tsx ─────────────────────────────────────────────────────────
// Consultation topic selector with left-border hover accent (matches Contact section).

import type { TopicOption } from "./types"

interface TopicSelectorProps {
  topics: TopicOption[]
  selectedTopic: string
  onTopicSelect: (id: string) => void
}

export function TopicSelector({
  topics,
  selectedTopic,
  onTopicSelect,
}: TopicSelectorProps) {
  return (
    <div className="space-y-0 border border-border">
      {topics.map((topic, idx) => {
        const isSelected = selectedTopic === topic.id
        return (
          <button
            key={topic.id}
            type="button"
            onClick={() => onTopicSelect(topic.id)}
            className={[
              "group w-full border-l-2 px-4 py-3 text-left transition-all duration-150",
              // Divider between items (not last)
              idx < topics.length - 1 ? "border-b border-b-border/60" : "",
              isSelected
                ? "border-l-primary bg-primary/5"
                : "border-l-transparent bg-background hover:border-l-primary/50 hover:bg-primary/[0.03]",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p
                  className={[
                    "font-mono text-xs leading-tight font-semibold",
                    isSelected
                      ? "text-foreground"
                      : "text-muted-foreground group-hover:text-foreground",
                  ].join(" ")}
                >
                  {topic.title}
                </p>
                <p className="mt-0.5 line-clamp-1 font-mono text-[10px] text-muted-foreground/70">
                  {topic.desc}
                </p>
              </div>
              <span
                className={[
                  "mt-0.5 shrink-0 border px-1.5 py-px font-mono text-[9px] font-bold tracking-wider uppercase",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground group-hover:border-primary/40 group-hover:text-primary/80",
                ].join(" ")}
              >
                {topic.badge}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
