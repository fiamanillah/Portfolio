// src/components/Profile/ProfileContainer.tsx
import { useState, useEffect } from "react"
import { useAuthSession } from "@/lib/authStore"
import { useProfileState } from "@/lib/profileStore"
import { ProfileHeader } from "./ProfileHeader"
import { GuestProfileBanner } from "./shared/GuestProfileBanner"
import { ProfileInfoCard } from "./sections/ProfileInfoCard"
import { PasswordSecurityCard } from "./sections/PasswordSecurityCard"
import { SubscriptionAccountCard } from "./sections/SubscriptionAccountCard"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserCircleIcon,
  LockIcon,
  Notification01Icon,
  ArrowRight01Icon,
  Home01Icon,
} from "@hugeicons/core-free-icons"

export type SimpleProfileTab = "info" | "security" | "subscription"

export function ProfileContainer() {
  const { user, isAuthenticated, syncSession } = useAuthSession()
  const { profile } = useProfileState()

  const [activeTab, setActiveTab] = useState<SimpleProfileTab>("info")

  useEffect(() => {
    // Validate session on mount
    syncSession()
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "") as SimpleProfileTab
      if (["info", "security", "subscription"].includes(hash)) {
        setActiveTab(hash)
      }
    }
  }, [])

  const handleTabChange = (tab: SimpleProfileTab) => {
    setActiveTab(tab)
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${tab}`)
    }
  }

  const effectiveUser = user || profile

  const tabs = [
    {
      id: "info" as SimpleProfileTab,
      label: "Profile & Identity",
      icon: UserCircleIcon,
    },
    {
      id: "security" as SimpleProfileTab,
      label: "Password & Security",
      icon: LockIcon,
    },
    {
      id: "subscription" as SimpleProfileTab,
      label: "Preferences & Account",
      icon: Notification01Icon,
    },
  ]

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6 sm:py-12">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumbs"
        className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground"
      >
        <a
          href="/"
          className="flex items-center gap-1 transition-colors hover:text-foreground"
        >
          <HugeiconsIcon icon={Home01Icon} className="size-3.5" />
          <span>Home</span>
        </a>
        <HugeiconsIcon icon={ArrowRight01Icon} className="size-3 text-border" />
        <span className="font-semibold text-foreground">Account Profile</span>
      </nav>

      {/* Guest Banner */}
      {(!isAuthenticated || !effectiveUser) && <GuestProfileBanner />}

      {/* When Authenticated: Header & Profile Editing Cards */}
      {effectiveUser && (
        <>
          <ProfileHeader user={effectiveUser} />

          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center gap-1 border border-border/80 bg-muted/20 p-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`relative flex cursor-pointer items-center gap-2 px-3.5 py-2 font-mono text-xs font-semibold transition-all ${
                    isActive
                      ? "border border-border bg-background font-bold text-primary shadow-xs"
                      : "border border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <HugeiconsIcon icon={tab.icon} className="size-3.5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Tab Content */}
          <div className="pt-1">
            {activeTab === "info" && <ProfileInfoCard user={effectiveUser} />}

            {activeTab === "security" && (
              <PasswordSecurityCard user={effectiveUser} />
            )}

            {activeTab === "subscription" && (
              <SubscriptionAccountCard user={effectiveUser} />
            )}
          </div>
        </>
      )}
    </div>
  )
}
