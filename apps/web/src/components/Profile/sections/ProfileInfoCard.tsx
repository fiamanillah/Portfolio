// src/components/Profile/sections/ProfileInfoCard.tsx
import { useState, type FormEvent, useEffect } from "react"
import { ProfileSectionCard } from "../shared/ProfileSectionCard"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@workspace/ui/components/field"
import { toast } from "@workspace/ui/components/sonner"
import { useProfileState } from "@/lib/profileStore"
import type { AuthUser } from "@workspace/shared"
import { updateProfileSchema } from "@workspace/shared"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Tick02Icon,
  Loading03Icon,
  CheckmarkCircle02Icon,
  GlobeIcon,
  GithubIcon,
  NewTwitterIcon,
  Linkedin02Icon,
  Location01Icon,
  Mail01Icon,
  Shield01Icon,
  Calendar01Icon,
} from "@hugeicons/core-free-icons"

interface ProfileInfoCardProps {
  user: AuthUser
}

export function ProfileInfoCard({ user }: ProfileInfoCardProps) {
  const { updateProfile } = useProfileState()

  // Form State
  const [name, setName] = useState(user.name || "")
  const [username, setUsername] = useState(user.username || "")
  const [headline, setHeadline] = useState(user.headline || "")
  const [location, setLocation] = useState(user.location || "")
  const [bio, setBio] = useState(user.bio || "")
  const [website, setWebsite] = useState(user.website || "")
  const [githubUrl, setGithubUrl] = useState(user.githubUrl || "")
  const [twitterUrl, setTwitterUrl] = useState(user.twitterUrl || "")
  const [linkedinUrl, setLinkedinUrl] = useState(user.linkedinUrl || "")

  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setName(user.name || "")
    setUsername(user.username || "")
    setHeadline(user.headline || "")
    setLocation(user.location || "")
    setBio(user.bio || "")
    setWebsite(user.website || "")
    setGithubUrl(user.githubUrl || "")
    setTwitterUrl(user.twitterUrl || "")
    setLinkedinUrl(user.linkedinUrl || "")
  }, [user.id, user.updatedAt])

  const validate = () => {
    const err: Record<string, string> = {}
    if (!name.trim()) err.name = "Full name is required."
    if (!username.trim()) err.username = "Username is required."

    const parseResult = updateProfileSchema.safeParse({
      name: name.trim() || undefined,
      username: username.toLowerCase().trim() || undefined,
      headline: headline.trim() || undefined,
      location: location.trim() || undefined,
      bio: bio.trim() || undefined,
      website: website.trim() || undefined,
      githubUrl: githubUrl.trim() || undefined,
      twitterUrl: twitterUrl.trim() || undefined,
      linkedinUrl: linkedinUrl.trim() || undefined,
    })

    if (!parseResult.success) {
      parseResult.error.issues.forEach((issue) => {
        const field = issue.path[0] as string
        if (field && !err[field]) err[field] = issue.message
      })
    }

    setErrors(err)
    return Object.keys(err).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      toast.error("Validation Error", {
        description: "Please resolve the highlighted form errors and try again.",
      })
      return
    }

    setIsSaving(true)
    try {
      const res = await updateProfile({
        name: name.trim(),
        username: username.toLowerCase().trim(),
        headline: headline.trim() || undefined,
        location: location.trim() || undefined,
        bio: bio.trim() || undefined,
        website: website.trim() || undefined,
        githubUrl: githubUrl.trim() || undefined,
        twitterUrl: twitterUrl.trim() || undefined,
        linkedinUrl: linkedinUrl.trim() || undefined,
      })

      if (res.success) {
        toast.success("Profile Updated", {
          description: "Your personal information and public links have been saved.",
        })
      } else {
        toast.error("Failed to Save Profile", {
          description: res.error || "Please check your inputs and try again.",
        })
      }
    } finally {
      setIsSaving(false)
    }
  }

  const formattedJoinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Recently"

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Personal & Professional Identity */}
      <ProfileSectionCard
        id="section-personal-identity"
        title="Personal & Professional Information"
        description="Manage your display name, handle, title, location, and biography."
        headerAction={
          <Button
            type="submit"
            size="sm"
            disabled={isSaving}
            className="rounded-none font-mono text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer h-8 px-3"
          >
            {isSaving ? (
              <>
                <HugeiconsIcon icon={Loading03Icon} className="size-3.5 mr-1.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <HugeiconsIcon icon={Tick02Icon} className="size-3.5 mr-1.5" />
                Save Changes
              </>
            )}
          </Button>
        }
      >
        <div className="space-y-4">
          <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Full Name */}
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="info-name" className="font-mono text-xs font-semibold">
                Full Name <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="info-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (errors.name) setErrors((prev) => ({ ...prev, name: "" }))
                }}
                className="rounded-none font-mono text-xs border-border bg-background/50 focus:border-primary"
                placeholder="e.g. Elena Rostova"
                required
              />
              <FieldError errors={errors.name} />
            </Field>

            {/* Username */}
            <Field data-invalid={!!errors.username}>
              <FieldLabel htmlFor="info-username" className="font-mono text-xs font-semibold">
                Username Handle <span className="text-destructive">*</span>
              </FieldLabel>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-xs text-primary">
                  @
                </span>
                <Input
                  id="info-username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
                    if (errors.username) setErrors((prev) => ({ ...prev, username: "" }))
                  }}
                  className="rounded-none font-mono text-xs border-border bg-background/50 pl-7 focus:border-primary"
                  placeholder="username"
                  required
                />
              </div>
              <FieldError errors={errors.username} />
            </Field>

            {/* Professional Headline */}
            <Field data-invalid={!!errors.headline}>
              <FieldLabel htmlFor="info-headline" className="font-mono text-xs font-semibold">
                Professional Title / Headline
              </FieldLabel>
              <Input
                id="info-headline"
                type="text"
                value={headline}
                onChange={(e) => {
                  setHeadline(e.target.value)
                  if (errors.headline) setErrors((prev) => ({ ...prev, headline: "" }))
                }}
                className="rounded-none font-mono text-xs border-border bg-background/50 focus:border-primary"
                placeholder="e.g. Senior Distributed Systems Engineer"
              />
              <FieldError errors={errors.headline} />
            </Field>

            {/* Location */}
            <Field data-invalid={!!errors.location}>
              <FieldLabel htmlFor="info-location" className="font-mono text-xs font-semibold">
                Location & Timezone
              </FieldLabel>
              <div className="relative">
                <HugeiconsIcon
                  icon={Location01Icon}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground"
                />
                <Input
                  id="info-location"
                  type="text"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value)
                    if (errors.location) setErrors((prev) => ({ ...prev, location: "" }))
                  }}
                  className="rounded-none font-mono text-xs border-border bg-background/50 pl-8 focus:border-primary"
                  placeholder="e.g. San Francisco, CA (UTC-8)"
                />
              </div>
              <FieldError errors={errors.location} />
            </Field>
          </FieldGroup>

          {/* Bio Textarea */}
          <Field data-invalid={!!errors.bio}>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="info-bio" className="font-mono text-xs font-semibold">
                About & Technical Bio
              </FieldLabel>
              <span className="font-mono text-[10px] text-muted-foreground">
                {bio.length} / 500
              </span>
            </div>
            <Textarea
              id="info-bio"
              rows={3}
              maxLength={500}
              value={bio}
              onChange={(e) => {
                setBio(e.target.value)
                if (errors.bio) setErrors((prev) => ({ ...prev, bio: "" }))
              }}
              className="rounded-none font-sans text-xs border-border bg-background/50 focus:border-primary leading-relaxed resize-y min-h-[80px]"
              placeholder="Share a brief overview of your background, engineering interests, or projects..."
            />
            <FieldDescription className="font-mono text-[10px]">
              Displayed in discussion threads and community comments.
            </FieldDescription>
            <FieldError errors={errors.bio} />
          </Field>
        </div>
      </ProfileSectionCard>

      {/* 2. Online Presence & Social Profiles */}
      <ProfileSectionCard
        id="section-social-links"
        title="Online Presence & Links"
        description="Add links to your portfolio, GitHub, LinkedIn, and X profiles."
      >
        <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Website / Portfolio */}
          <Field data-invalid={!!errors.website}>
            <FieldLabel htmlFor="link-website" className="font-mono text-xs font-semibold">
              Website / Portfolio URL
            </FieldLabel>
            <div className="relative">
              <HugeiconsIcon
                icon={GlobeIcon}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground"
              />
              <Input
                id="link-website"
                type="url"
                value={website}
                onChange={(e) => {
                  setWebsite(e.target.value)
                  if (errors.website) setErrors((prev) => ({ ...prev, website: "" }))
                }}
                className="rounded-none font-mono text-xs border-border bg-background/50 pl-8 focus:border-primary"
                placeholder="https://fiamanillah.dev"
              />
            </div>
            <FieldError errors={errors.website} />
          </Field>

          {/* GitHub URL */}
          <Field data-invalid={!!errors.githubUrl}>
            <FieldLabel htmlFor="link-github" className="font-mono text-xs font-semibold">
              GitHub Profile
            </FieldLabel>
            <div className="relative">
              <HugeiconsIcon
                icon={GithubIcon}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground"
              />
              <Input
                id="link-github"
                type="text"
                value={githubUrl}
                onChange={(e) => {
                  setGithubUrl(e.target.value)
                  if (errors.githubUrl) setErrors((prev) => ({ ...prev, githubUrl: "" }))
                }}
                className="rounded-none font-mono text-xs border-border bg-background/50 pl-8 focus:border-primary"
                placeholder="https://github.com/username"
              />
            </div>
            <FieldError errors={errors.githubUrl} />
          </Field>

          {/* Twitter / X */}
          <Field data-invalid={!!errors.twitterUrl}>
            <FieldLabel htmlFor="link-twitter" className="font-mono text-xs font-semibold">
              X (Twitter) Profile
            </FieldLabel>
            <div className="relative">
              <HugeiconsIcon
                icon={NewTwitterIcon}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground"
              />
              <Input
                id="link-twitter"
                type="text"
                value={twitterUrl}
                onChange={(e) => {
                  setTwitterUrl(e.target.value)
                  if (errors.twitterUrl) setErrors((prev) => ({ ...prev, twitterUrl: "" }))
                }}
                className="rounded-none font-mono text-xs border-border bg-background/50 pl-8 focus:border-primary"
                placeholder="https://twitter.com/username"
              />
            </div>
            <FieldError errors={errors.twitterUrl} />
          </Field>

          {/* LinkedIn */}
          <Field data-invalid={!!errors.linkedinUrl}>
            <FieldLabel htmlFor="link-linkedin" className="font-mono text-xs font-semibold">
              LinkedIn Profile
            </FieldLabel>
            <div className="relative">
              <HugeiconsIcon
                icon={Linkedin02Icon}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground"
              />
              <Input
                id="link-linkedin"
                type="text"
                value={linkedinUrl}
                onChange={(e) => {
                  setLinkedinUrl(e.target.value)
                  if (errors.linkedinUrl) setErrors((prev) => ({ ...prev, linkedinUrl: "" }))
                }}
                className="rounded-none font-mono text-xs border-border bg-background/50 pl-8 focus:border-primary"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <FieldError errors={errors.linkedinUrl} />
          </Field>
        </FieldGroup>
      </ProfileSectionCard>

      {/* 3. Account Information (Read-Only Status Overview) */}
      <ProfileSectionCard
        id="section-account-meta"
        title="Account Details & Status"
        description="System verification and account security details."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Email Card */}
          <div className="border border-border/80 bg-muted/20 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-[11px]">
              <HugeiconsIcon icon={Mail01Icon} className="size-3.5 text-primary" />
              <span>Registered Email</span>
            </div>
            <p className="font-mono text-xs font-bold text-foreground truncate">
              {user.email}
            </p>
            <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-500 font-semibold">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3" />
              Verified & Active
            </span>
          </div>

          {/* Role Card */}
          <div className="border border-border/80 bg-muted/20 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-[11px]">
              <HugeiconsIcon icon={Shield01Icon} className="size-3.5 text-primary" />
              <span>Account Role</span>
            </div>
            <p className="font-mono text-xs font-bold text-primary uppercase">
              {typeof user.role === "string" ? user.role : "USER"}
            </p>
            <p className="font-mono text-[10px] text-muted-foreground">
              Role-based access level
            </p>
          </div>

          {/* Member Since Card */}
          <div className="border border-border/80 bg-muted/20 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-[11px]">
              <HugeiconsIcon icon={Calendar01Icon} className="size-3.5 text-primary" />
              <span>Member Since</span>
            </div>
            <p className="font-mono text-xs font-bold text-foreground">
              {formattedJoinDate}
            </p>
            <p className="font-mono text-[10px] text-muted-foreground">
              Account activation date
            </p>
          </div>
        </div>
      </ProfileSectionCard>
    </form>
  )
}
