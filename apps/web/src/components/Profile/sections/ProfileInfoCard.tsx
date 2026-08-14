import { useState, type FormEvent, useEffect } from "react"
import { ProfileSectionCard } from "../shared/ProfileSectionCard"
import { AvatarSelectorModal } from "../shared/AvatarSelectorModal"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@workspace/ui/components/field"
import { toast } from "@workspace/ui/components/sonner"
import { useProfileState } from "@/lib/profileStore"
import type { AuthUser } from "@/data/commentsData"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Tick02Icon,
  Image01Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"

interface ProfileInfoCardProps {
  user: AuthUser
}

export function ProfileInfoCard({ user }: ProfileInfoCardProps) {
  const { updateProfile } = useProfileState()

  const [name, setName] = useState(user.name || "")
  const [username, setUsername] = useState(user.username || "")
  const [email, setEmail] = useState(user.email || "")
  const [role, setRole] = useState(user.role || "")
  const [bio, setBio] = useState(user.bio || "")
  const [avatar, setAvatar] = useState(user.avatar || "")

  const [avatarModalOpen, setAvatarModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setName(user.name || "")
    setUsername(user.username || "")
    setEmail(user.email || "")
    setRole(user.role || "")
    setBio(user.bio || "")
    setAvatar(user.avatar || "")
  }, [user.id, user.avatar])

  const validate = () => {
    const err: Record<string, string> = {}
    if (!name.trim()) err.name = "Full name is required."
    if (!username.trim()) err.username = "Username is required."
    else if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
      err.username = "Username must be 3-30 characters (letters, numbers, underscore)."
    }
    if (!email.trim()) err.email = "Email address is required."
    else if (!/^\S+@\S+\.\S+$/.test(email)) err.email = "Please enter a valid email."

    setErrors(err)
    return Object.keys(err).length === 0
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      toast.error("Please fill in required fields correctly.")
      return
    }

    setIsSaving(true)
    setTimeout(() => {
      updateProfile({
        name: name.trim(),
        username: username.toLowerCase().trim(),
        email: email.trim(),
        role: role.trim(),
        bio: bio.trim(),
        avatar,
      })
      setIsSaving(false)
      toast.success("Profile Information Saved", {
        description: "Your details have been updated across your account session.",
      })
    }, 400)
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Avatar Section */}
        <ProfileSectionCard
          id="section-avatar"
          title="Profile Photo"
          description="Choose how you appear across comments and your profile."
        >
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <img
                src={avatar || user.avatar}
                alt={name}
                className="size-16 rounded-full border-2 border-border object-cover"
              />
              <button
                type="button"
                onClick={() => setAvatarModalOpen(true)}
                className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                title="Change avatar"
              >
                <HugeiconsIcon icon={Image01Icon} className="size-3" />
              </button>
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">
                {name || "Anonymous User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                @{username || "username"} · {email || "email"}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAvatarModalOpen(true)}
                className="mt-2 h-7 rounded-md text-xs cursor-pointer"
              >
                Change Avatar
              </Button>
            </div>
          </div>
        </ProfileSectionCard>

        {/* Personal Info */}
        <ProfileSectionCard
          id="section-profile-info"
          title="Personal Information"
          description="Update your display name, username, email, and role."
          headerAction={
            <Button
              type="submit"
              size="sm"
              disabled={isSaving}
              className="rounded-md text-xs cursor-pointer"
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
                <FieldLabel htmlFor="info-name" className="text-xs">
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
                  className="rounded-md text-sm"
                  placeholder="e.g. Fi Amanillah"
                />
                {errors.name && <FieldError className="text-xs">{errors.name}</FieldError>}
              </Field>

              {/* Username */}
              <Field data-invalid={!!errors.username}>
                <FieldLabel htmlFor="info-username" className="text-xs">
                  Username <span className="text-destructive">*</span>
                </FieldLabel>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
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
                    className="rounded-md text-sm pl-7"
                    placeholder="username"
                  />
                </div>
                {errors.username && <FieldError className="text-xs">{errors.username}</FieldError>}
              </Field>

              {/* Email */}
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="info-email" className="text-xs">
                  Email Address <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="info-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) setErrors((prev) => ({ ...prev, email: "" }))
                  }}
                  className="rounded-md text-sm"
                  placeholder="user@example.com"
                />
                {errors.email && <FieldError className="text-xs">{errors.email}</FieldError>}
              </Field>

              {/* Role */}
              <Field>
                <FieldLabel htmlFor="info-role" className="text-xs">
                  Role / Title
                </FieldLabel>
                <Input
                  id="info-role"
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="rounded-md text-sm"
                  placeholder="e.g. Software Engineer"
                />
              </Field>
            </FieldGroup>

            {/* Bio */}
            <Field>
              <FieldLabel htmlFor="info-bio" className="text-xs">
                Bio
              </FieldLabel>
              <Textarea
                id="info-bio"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="rounded-md text-sm"
                placeholder="A brief introduction about yourself..."
              />
              <div className="flex justify-end text-[11px] text-muted-foreground mt-1">
                {bio.length} / 250
              </div>
            </Field>
          </div>
        </ProfileSectionCard>
      </form>

      <AvatarSelectorModal
        open={avatarModalOpen}
        onOpenChange={setAvatarModalOpen}
        currentAvatar={avatar || user.avatar}
        onSaveAvatar={(newAvatar) => {
          setAvatar(newAvatar)
          updateProfile({ avatar: newAvatar })
          toast.success("Avatar updated!")
        }}
      />
    </>
  )
}
