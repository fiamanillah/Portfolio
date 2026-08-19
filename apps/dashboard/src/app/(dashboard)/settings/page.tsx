"use client"

import * as React from "react"
import Link from "next/link"
import {
  Bell,
  Check,
  Globe,
  Key,
  Save,
  ShieldCheck,
  ShieldAlert,
  User,
  Lock,
  Loader2,
  Sparkles,
  ExternalLink,
  Shield,
  Eye,
  EyeOff,
  Upload,
  Trash2,
  Camera,
  FileText,
  Download,
  FileCheck,
  FileUp,
  Plus,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Switch } from "@workspace/ui/components/switch"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import { useAuth } from "@/providers/auth-provider"
import { UserApi, getStoredAccessToken } from "@/lib/api"
import { toast } from "@workspace/ui/components/sonner"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"

export default function SettingsPage() {
  const { user, refreshUser } = useAuth()

  // Profile Form State
  const [name, setName] = React.useState(user?.name || "")
  const [bio, setBio] = React.useState(user?.bio || "")
  const [headline, setHeadline] = React.useState(user?.headline || "")
  const [location, setLocation] = React.useState(user?.location || "")
  const [website, setWebsite] = React.useState(user?.website || "")
  const [githubUrl, setGithubUrl] = React.useState(user?.githubUrl || "")
  const [isSavingProfile, setIsSavingProfile] = React.useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false)
  const [isDeletingAvatar, setIsDeletingAvatar] = React.useState(false)
  const avatarInputRef = React.useRef<HTMLInputElement>(null)

  // Resume Management State
  const [isUploadingResume, setIsUploadingResume] = React.useState(false)
  const [isDeletingResume, setIsDeletingResume] = React.useState(false)
  const resumeInputRef = React.useRef<HTMLInputElement>(null)

  // Password Form State
  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [isChangingPassword, setIsChangingPassword] = React.useState(false)

  React.useEffect(() => {
    if (user) {
      setName(user.name || "")
      setBio(user.bio || "")
      setHeadline(user.headline || "")
      setLocation(user.location || "")
      setWebsite(user.website || "")
      setGithubUrl(user.githubUrl || "")
    }
  }, [user])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Invalid File", {
        description: "Please select an image file (PNG, JPG, WebP, SVG).",
      })
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File Too Large", {
        description: "Avatar image size must be under 10MB.",
      })
      return
    }

    try {
      setIsUploadingAvatar(true)
      const res = await UserApi.uploadAvatar(file)
      if (res.success) {
        await refreshUser()
        toast.success("Avatar Uploaded", {
          description:
            "Profile picture uploaded to Cloudflare R2 / S3 storage.",
        })
      } else {
        toast.error("Upload Failed", {
          description: res.error || "Could not upload profile picture.",
        })
      }
    } catch (err: any) {
      toast.error("Upload Error", { description: err?.message })
    } finally {
      setIsUploadingAvatar(false)
      if (avatarInputRef.current) {
        avatarInputRef.current.value = ""
      }
    }
  }

  const handleRemoveAvatar = async () => {
    try {
      setIsDeletingAvatar(true)
      const res = await UserApi.deleteAvatar()
      if (res.success) {
        await refreshUser()
        toast.success("Avatar Removed", {
          description: "Profile picture has been removed.",
        })
      } else {
        toast.error("Removal Failed", {
          description: res.error || "Could not remove avatar.",
        })
      }
    } catch (err: any) {
      toast.error("Error", { description: err?.message })
    } finally {
      setIsDeletingAvatar(false)
    }
  }

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/octet-stream",
    ]
    const ext = file.name.split(".").pop()?.toLowerCase() || ""

    if (
      !allowedMimeTypes.includes(file.type) &&
      !["pdf", "doc", "docx"].includes(ext)
    ) {
      toast.error("Invalid File Type", {
        description:
          "Please select a PDF or Word document (.pdf, .doc, .docx).",
      })
      return
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error("File Too Large", {
        description: "Resume file size must be under 20MB.",
      })
      return
    }

    try {
      setIsUploadingResume(true)
      const res = await UserApi.uploadResume(file)
      if (res.success) {
        await refreshUser()
        toast.success("Resume Uploaded", {
          description:
            "Your resume file has been published and uploaded to Cloudflare R2 / S3.",
        })
      } else {
        toast.error("Upload Failed", {
          description: res.error || "Could not upload resume.",
        })
      }
    } catch (err: any) {
      toast.error("Upload Error", { description: err?.message })
    } finally {
      setIsUploadingResume(false)
      if (resumeInputRef.current) {
        resumeInputRef.current.value = ""
      }
    }
  }

  const handleRemoveResume = async () => {
    try {
      setIsDeletingResume(true)
      const res = await UserApi.deleteResume()
      if (res.success) {
        await refreshUser()
        toast.success("Resume Removed", {
          description: "Resume file has been deleted from cloud storage.",
        })
      } else {
        toast.error("Removal Failed", {
          description: res.error || "Could not remove resume.",
        })
      }
    } catch (err: any) {
      toast.error("Error", { description: err?.message })
    } finally {
      setIsDeletingResume(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSavingProfile(true)
      const res = await UserApi.updateProfile({
        name,
        bio,
        headline,
        location,
        website,
        githubUrl,
      })

      if (res.success) {
        await refreshUser()
        toast.success("Profile Updated", {
          description: "Your administrator details have been saved.",
        })
      } else {
        toast.error("Update Failed", {
          description: res.error || "Could not save profile changes.",
        })
      }
    } catch (err: any) {
      toast.error("Error", { description: err?.message })
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentPassword || !newPassword) {
      toast.error("Missing fields", {
        description: "Please enter both your current and new password.",
      })
      return
    }

    if (newPassword.length < 8) {
      toast.error("Weak password", {
        description: "New password must be at least 8 characters.",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mismatch", {
        description: "New password and confirmation do not match.",
      })
      return
    }

    try {
      setIsChangingPassword(true)
      const res = await UserApi.changePassword(currentPassword, newPassword)

      if (res.success) {
        toast.success("Password Changed", {
          description: "Your administrator password has been updated.",
        })
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        toast.error("Password update failed", {
          description: res.error || "Incorrect current password.",
        })
      }
    } catch (err: any) {
      toast.error("Error changing password", { description: err?.message })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const token = getStoredAccessToken()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Platform & Security Settings
            </h1>
            <Badge
              variant="outline"
              className="border-primary/30 font-mono text-xs text-primary"
            >
              Super Admin
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your administrator credentials, encryption keys, RBAC session
            telemetry, and platform configurations.
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted/60 p-1">
          <TabsTrigger value="general" className="gap-2 text-xs">
            <User className="size-3.5" />
            Admin Profile
          </TabsTrigger>
          <TabsTrigger value="resume" className="gap-2 text-xs">
            <FileText className="size-3.5" />
            Resume / CV
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 text-xs">
            <Lock className="size-3.5" />
            Security & Password
          </TabsTrigger>
          <TabsTrigger value="session" className="gap-2 text-xs">
            <ShieldCheck className="size-3.5" />
            Session Telemetry
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <form onSubmit={handleSaveProfile}>
            <Card className="border-border/80">
              <CardHeader>
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3.5">
                    <div className="group relative shrink-0">
                      <Avatar className="size-14 rounded-xl border-2 border-border shadow-sm">
                        <AvatarImage
                          src={user?.avatar || undefined}
                          alt={user?.name || "Admin"}
                          className="object-cover"
                        />
                        <AvatarFallback className="rounded-xl bg-primary/10 text-sm font-bold text-primary">
                          {user?.name?.slice(0, 2).toUpperCase() || "AD"}
                        </AvatarFallback>
                      </Avatar>
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                        className="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow transition-transform hover:bg-primary/90 active:scale-95"
                        title="Upload Avatar to Cloud Storage"
                      >
                        {isUploadingAvatar ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <Camera className="size-3" />
                        )}
                      </button>
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">
                        Administrator Profile
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Public author credentials & avatar stored in Cloudflare
                        R2 / S3.
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isUploadingAvatar}
                      onClick={() => avatarInputRef.current?.click()}
                      className="h-8 gap-1.5 text-xs"
                    >
                      {isUploadingAvatar ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="size-3.5" />
                          Upload S3 Photo
                        </>
                      )}
                    </Button>
                    {user?.avatar && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isDeletingAvatar}
                        onClick={handleRemoveAvatar}
                        className="h-8 gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        {isDeletingAvatar ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="size-3.5" />
                        )}
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">
                      Display Name
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-9 text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">
                      Admin Email (System Bound)
                    </label>
                    <Input
                      value={user?.email || "fi@amanillah.dev"}
                      disabled
                      className="h-9 bg-muted/40 font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">
                      Headline / Title
                    </label>
                    <Input
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="Author & Lead Architect"
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">
                      Location
                    </label>
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Singapore / Remote"
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">
                    Public Bio
                  </label>
                  <Input
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Full Stack & DevOps Engineer building distributed systems."
                    className="h-9 text-xs"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">
                      Website URL
                    </label>
                    <Input
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://amanillah.dev"
                      className="h-9 font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">
                      GitHub URL
                    </label>
                    <Input
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/fiamanillah"
                      className="h-9 font-mono text-xs"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t border-border/60 py-3">
                <Button type="submit" size="sm" disabled={isSavingProfile}>
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-1.5 size-3.5" />
                      Save Profile Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        {/* Resume / CV Management Tab */}
        <TabsContent value="resume" className="space-y-6">
          <Card className="border-border/80">
            <CardHeader>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3.5">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-sm">
                    <FileText className="size-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base font-semibold">
                        Curriculum Vitae / Resume
                      </CardTitle>
                      {user?.resumeUrl ? (
                        <Badge
                          variant="outline"
                          className="border-emerald-500/30 bg-emerald-500/10 font-mono text-[10px] text-emerald-600 dark:text-emerald-400"
                        >
                          <CheckCircle2 className="mr-1 size-3" /> Live & Active
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-amber-500/30 bg-amber-500/10 font-mono text-[10px] text-amber-600 dark:text-amber-400"
                        >
                          <AlertCircle className="mr-1 size-3" /> Not Uploaded
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="mt-0.5 text-xs">
                      Manage the downloadable PDF / Word document synced across your portfolio.
                    </CardDescription>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    asChild
                    size="sm"
                    className="h-8 gap-1.5 text-xs shadow-sm"
                  >
                    <Link href="/resume">
                      <FileText className="size-3.5" />
                      Manage All Versions →
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {user?.resumeUrl ? (
                <div className="space-y-4">
                  {/* File Details Box */}
                  <div className="flex flex-col justify-between gap-4 rounded-xl border border-border/80 bg-muted/30 p-4 sm:flex-row sm:items-center">
                    <div className="flex items-start gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-background text-primary shadow-xs">
                        <FileCheck className="size-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">
                            Active Portfolio Resume Document
                          </p>
                          <Badge variant="secondary" className="font-mono text-[10px]">
                            Cloud Storage
                          </Badge>
                        </div>
                        <p className="max-w-md truncate font-mono text-xs text-muted-foreground">
                          {user.resumeUrl}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 text-xs"
                      >
                        <a
                          href={user.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                        >
                          <Download className="size-3.5 text-primary" />
                          Download File
                        </a>
                      </Button>
                      <Button
                        asChild
                        variant="secondary"
                        size="sm"
                        className="h-8 gap-1.5 text-xs"
                      >
                        <a
                          href={user.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="size-3.5" />
                          Preview in Browser
                        </a>
                      </Button>
                    </div>
                  </div>

                  {/* Integration Info Callout */}
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border border-border/60 bg-card p-3.5">
                      <div className="text-xs font-semibold text-foreground">
                        Hero Section
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Visitors can immediately download your CV directly from the homepage Hero CTA.
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-card p-3.5">
                      <div className="text-xs font-semibold text-foreground">
                        Dedicated Route
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Accessible anytime via <span className="font-mono text-primary">/resume</span> on your site.
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-card p-3.5">
                      <div className="text-xs font-semibold text-foreground">
                        About Terminal & History
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Synced with the interactive terminal command and Professional History section.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border/80 bg-muted/10 px-6 py-12 text-center">
                  <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <FileUp className="size-7" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      Multi-Version Resume Management
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Upload, version, track downloads, and manage all your resume PDF releases in the dedicated Resume Manager.
                    </p>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    className="mt-2 h-8 gap-1.5 text-xs"
                  >
                    <Link href="/resume">
                      <Plus className="size-3.5" />
                      Open Resume Manager
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security & Password Tab */}
        <TabsContent value="security" className="space-y-6">
          <form onSubmit={handleChangePassword}>
            <Card className="border-border/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Lock className="size-4 text-primary" />
                  <span>Change Administrator Password</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Ensure your Super Admin account is protected with a strong,
                  distinct password.
                </CardDescription>
              </CardHeader>
              <CardContent className="max-w-lg space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">
                    Current Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="h-9 pr-9 text-xs"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="size-3.5" />
                      ) : (
                        <Eye className="size-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">
                    New Password
                  </label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-9 text-xs"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">
                    Confirm New Password
                  </label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-9 text-xs"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t border-border/60 py-3">
                <Button type="submit" size="sm" disabled={isChangingPassword}>
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <Key className="mr-1.5 size-3.5" />
                      Update Password
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        {/* Session Telemetry Tab */}
        <TabsContent value="session" className="space-y-6">
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <ShieldCheck className="size-4 text-emerald-500" />
                <span>Active Cryptographic Session</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Inspect your verified JWT tokens and active access control
                credentials.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1 rounded-xl border border-border/70 bg-muted/20 p-3">
                  <span className="text-[11px] text-muted-foreground">
                    User ID
                  </span>
                  <p className="truncate font-mono text-xs font-semibold">
                    {user?.id || "—"}
                  </p>
                </div>
                <div className="space-y-1 rounded-xl border border-border/70 bg-muted/20 p-3">
                  <span className="text-[11px] text-muted-foreground">
                    Assigned Role
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="default" className="font-mono text-[10px]">
                      {user?.role || "ADMIN"}
                    </Badge>
                    <span className="text-[11px] font-medium text-emerald-500">
                      Verified
                    </span>
                  </div>
                </div>
                <div className="space-y-1 rounded-xl border border-border/70 bg-muted/20 p-3">
                  <span className="text-[11px] text-muted-foreground">
                    Email Status
                  </span>
                  <p className="flex items-center gap-1 text-xs font-semibold text-emerald-500">
                    <Check className="size-3.5" />
                    Verified ({user?.email})
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground">
                    Active JWT Bearer Token (Masked)
                  </label>
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] text-primary"
                  >
                    Valid Session
                  </Badge>
                </div>
                <Input
                  type="password"
                  value={token || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
                  className="h-9 bg-muted/40 font-mono text-xs"
                  readOnly
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
