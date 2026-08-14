import { Button } from "@workspace/ui/components/button"
import { FieldSeparator } from "@workspace/ui/components/field"
import { DEMO_USERS } from "@/data/commentsData"
import { HugeiconsIcon } from "@hugeicons/react"
import { FlashIcon, GithubIcon, GoogleIcon } from "@hugeicons/core-free-icons"

interface QuickLoginStepProps {
  onSelectDemo: (userId: string) => void
  onSelectOAuth: (provider: "GitHub" | "Google") => void
}

export function QuickLoginStep({ onSelectDemo, onSelectOAuth }: QuickLoginStepProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-none border border-primary/20 bg-primary/5 p-3 flex items-start gap-2.5">
        <HugeiconsIcon icon={FlashIcon} className="size-4 text-primary shrink-0 mt-0.5" />
        <p className="font-mono text-[11px] text-foreground/80 leading-relaxed">
          <strong className="text-primary font-semibold">Instant Access</strong>: Select any pre-configured profile to test comments, likes, replies, and bookmarks without typing passwords.
        </p>
      </div>

      <div className="space-y-2">
        {DEMO_USERS.map((demo) => (
          <button
            key={demo.id}
            type="button"
            onClick={() => onSelectDemo(demo.id)}
            className="group w-full flex items-center justify-between border border-border bg-background/80 p-2.5 transition-all duration-150 hover:border-primary hover:bg-primary/5 text-left cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={demo.avatar}
                alt={demo.name}
                className="size-9 rounded-full border border-primary/40 object-cover shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                    {demo.name}
                  </span>
                  {demo.badge && (
                    <span className="border border-primary/30 bg-primary/10 px-1.5 py-0.2 font-mono text-[9px] font-semibold text-primary uppercase">
                      {demo.badge}
                    </span>
                  )}
                </div>
                <p className="font-mono text-[10px] text-muted-foreground truncate">
                  {demo.role}
                </p>
              </div>
            </div>

            <span className="font-mono text-xs text-primary/80 opacity-0 transition-opacity group-hover:opacity-100 shrink-0 ml-2">
              Select →
            </span>
          </button>
        ))}
      </div>

      {/* Quick OAuth Simulation */}
      <FieldSeparator>Or continue with social account</FieldSeparator>
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onSelectOAuth("GitHub")}
          className="rounded-none font-mono text-xs h-8 border-border hover:border-primary hover:text-primary cursor-pointer flex items-center justify-center gap-1.5"
        >
          <HugeiconsIcon icon={GithubIcon} className="size-3.5" />
          <span>GitHub</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onSelectOAuth("Google")}
          className="rounded-none font-mono text-xs h-8 border-border hover:border-primary hover:text-primary cursor-pointer flex items-center justify-center gap-1.5"
        >
          <HugeiconsIcon icon={GoogleIcon} className="size-3.5" />
          <span>Google</span>
        </Button>
      </div>
    </div>
  )
}
