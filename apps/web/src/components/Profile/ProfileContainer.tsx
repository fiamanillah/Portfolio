import { useState, useEffect } from "react"
import { useAuthSession } from "@/lib/authStore"
import { useProfileState } from "@/lib/profileStore"
import { DEMO_USERS } from "@/data/commentsData"
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
  const { user, isAuthenticated } = useAuthSession()
  const { profile } = useProfileState()

  const [activeTab, setActiveTab] = useState<SimpleProfileTab>("info")

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

  const effectiveUser = user || profile || DEMO_USERS[0]

  const tabs = [
    {
      id: "info" as SimpleProfileTab,
      label: "Profile",
      icon: UserCircleIcon,
    },
    {
      id: "security" as SimpleProfileTab,
      label: "Security",
      icon: LockIcon,
    },
    {
      id: "subscription" as SimpleProfileTab,
      label: "Subscription",
      icon: Notification01Icon,
    },
  ]

  return (
    <div className="py-8 sm:py-12 space-y-6 max-w-3xl mx-auto px-4 sm:px-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <a href="/" className="hover:text-foreground flex items-center gap-1 transition-colors">
          <HugeiconsIcon icon={Home01Icon} className="size-3.5" />
          <span>Home</span>
        </a>
        <HugeiconsIcon icon={ArrowRight01Icon} className="size-3 text-border" />
        <span className="text-foreground font-medium">Profile</span>
      </nav>

      {/* Guest Banner */}
      {(!isAuthenticated || !user) && <GuestProfileBanner />}

      {/* Header */}
      <ProfileHeader user={effectiveUser} />

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-border">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <HugeiconsIcon icon={tab.icon} className="size-4" />
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "info" && (
          <ProfileInfoCard user={effectiveUser} />
        )}

        {activeTab === "security" && (
          <PasswordSecurityCard user={effectiveUser} />
        )}

        {activeTab === "subscription" && (
          <SubscriptionAccountCard user={effectiveUser} />
        )}
      </div>
    </div>
  )
}
