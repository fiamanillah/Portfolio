"use client"

import * as React from "react"
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Mail,
  Pencil,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
  UserCheck,
  Users,
  UserX,
} from "lucide-react"

import type { AuthUser, Role } from "@workspace/shared"
import { UserApi } from "@/lib/api"
import { useAuth } from "@/providers/auth-provider"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { toast } from "@workspace/ui/components/sonner"
import { getUserColumns } from "./columns"
import { UsersDataTable } from "./data-table"

const ROLE_OPTIONS: Role[] = ["ADMIN", "MODERATOR", "AUTHOR", "USER"]

export default function UsersManagementPage() {
  const { user: currentAdmin } = useAuth()

  const [users, setUsers] = React.useState<AuthUser[]>([])
  const [stats, setStats] = React.useState<{
    total: number
    admins: number
    moderators: number
    authors: number
    users: number
  }>({
    total: 0,
    admins: 0,
    moderators: 0,
    authors: 0,
    users: 0,
  })
  const [isLoading, setIsLoading] = React.useState(true)

  // Query state
  const [searchQuery, setSearchQuery] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [roleFilter, setRoleFilter] = React.useState("ALL")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(20)
  const [totalCount, setTotalCount] = React.useState(0)

  // Dialog states
  const [targetUser, setTargetUser] = React.useState<AuthUser | null>(null)
  const [roleToAssign, setRoleToAssign] = React.useState<Role>("USER")
  const [isRoleDialogOpen, setIsRoleDialogOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false)
  const [isProcessing, setIsProcessing] = React.useState(false)

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch Users List
  const fetchUsers = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await UserApi.listUsersAdmin({
        page: currentPage,
        limit: pageSize,
        search: debouncedSearch || undefined,
        role: roleFilter !== "ALL" ? roleFilter : undefined,
        sortBy: "createdAt",
        sortOrder: "desc",
      })

      if (res.success && res.data) {
        setUsers(res.data)
        setTotalCount(res.pagination?.total || res.data.length)
        if (res.stats) {
          setStats(res.stats)
        } else {
          // Fallback calculation
          setStats({
            total: res.data.length,
            admins: res.data.filter((u) => u.role === "ADMIN").length,
            moderators: res.data.filter((u) => u.role === "MODERATOR").length,
            authors: res.data.filter((u) => u.role === "AUTHOR").length,
            users: res.data.filter((u) => u.role === "USER").length,
          })
        }
      } else {
        toast.error("Failed to load user list", {
          description:
            res.error || "Please ensure the backend API is connected.",
        })
      }
    } catch (err: any) {
      toast.error("Error loading users", {
        description: err?.message || "Network issue.",
      })
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, pageSize, debouncedSearch, roleFilter])

  React.useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Action handlers
  const handleRoleChangePrompt = (user: AuthUser) => {
    setTargetUser(user)
    setRoleToAssign((user.role as Role) || "USER")
    setIsRoleDialogOpen(true)
  }

  const handleDeletePrompt = (user: AuthUser) => {
    setTargetUser(user)
    setIsDeleteDialogOpen(true)
  }

  const handleViewDetails = (user: AuthUser) => {
    setTargetUser(user)
    setIsDetailsOpen(true)
  }

  // Confirm Role Change
  const handleRoleChangeConfirm = async () => {
    if (!targetUser) return

    if (targetUser.id === currentAdmin?.id && roleToAssign !== "ADMIN") {
      toast.error("Self-demotion blocked", {
        description: "You cannot revoke your own Super Administrator role.",
      })
      setIsRoleDialogOpen(false)
      return
    }

    try {
      setIsProcessing(true)
      const res = await UserApi.updateUserRole(targetUser.id, roleToAssign)

      if (res.success) {
        toast.success(`Role updated successfully`, {
          description: `${targetUser.name}'s role was updated to ${roleToAssign}.`,
        })
        setIsRoleDialogOpen(false)
        fetchUsers()
      } else {
        toast.error("Role update failed", {
          description: res.error || "Unable to modify user permissions.",
        })
      }
    } catch (err: any) {
      toast.error("Error updating role", {
        description: err?.message,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Confirm Delete User
  const handleDeleteUserConfirm = async () => {
    if (!targetUser) return

    if (targetUser.id === currentAdmin?.id) {
      toast.error("Action Prohibited", {
        description: "You cannot delete your own active administrator account.",
      })
      setIsDeleteDialogOpen(false)
      return
    }

    try {
      setIsProcessing(true)
      const res = await UserApi.deleteUser(targetUser.id)

      if (res.success) {
        toast.success("User account deleted", {
          description: `Successfully deleted user ${targetUser.email}.`,
        })
        setIsDeleteDialogOpen(false)
        fetchUsers()
      } else {
        toast.error("Deletion failed", {
          description: res.error || "Failed to remove user record.",
        })
      }
    } catch (err: any) {
      toast.error("Error deleting user", {
        description: err?.message,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Memoized Columns
  const columns = React.useMemo(() => {
    return getUserColumns({
      currentUserId: currentAdmin?.id,
      onChangeRole: handleRoleChangePrompt,
      onDeleteUser: handleDeletePrompt,
      onViewDetails: handleViewDetails,
    })
  }, [currentAdmin?.id])

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              User & Role Management
            </h1>
            <Badge
              variant="outline"
              className="border-primary/30 font-mono text-xs text-primary"
            >
              RBAC Control
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Super Administrator console to inspect users, assign roles (Admin,
            Moderator, Author, User), and manage platform access.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchUsers()}
            disabled={isLoading}
            className="gap-1.5 text-xs"
          >
            <RefreshCw
              className={`size-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/80 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Accounts
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Registered platform accounts
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Super Admins
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <ShieldCheck className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.admins}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Full console authorization
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Moderators
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <ShieldAlert className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {stats.moderators}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Content & comments stewards
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Members & Authors
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <UserCheck className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.users + stats.authors}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Community & contributors
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Users Table Card */}
      <Card className="border-border/80">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Platform Users & Roles
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time RBAC list with granular privilege management and
                sorting.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          <UsersDataTable
            columns={columns}
            data={users}
            isLoading={isLoading}
            totalCount={totalCount}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            roleFilter={roleFilter}
            onRoleFilterChange={setRoleFilter}
            onRefresh={fetchUsers}
          />
        </CardContent>
      </Card>

      {/* ── Dialog: Role Change ───────────────────────────────────────────── */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Shield className="size-4 text-primary" />
              <span>Modify User Role & Privileges</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Assign a new role to{" "}
              <span className="font-semibold text-foreground">
                {targetUser?.name}
              </span>{" "}
              ({targetUser?.email}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="text-xs font-medium">Select Target Role:</div>
            <div className="grid gap-2">
              {ROLE_OPTIONS.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setRoleToAssign(role)}
                  className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                    roleToAssign === role
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border/80 bg-background/50 hover:bg-muted"
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-xs font-medium uppercase">
                      <span>{role}</span>
                      {role === "ADMIN" && (
                        <Badge variant="default" className="h-4 text-[9px]">
                          Full Access
                        </Badge>
                      )}
                      {role === "MODERATOR" && (
                        <Badge variant="secondary" className="h-4 text-[9px]">
                          Moderation
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {role === "ADMIN" &&
                        "Full administrative power over users, templates, comments, and settings."}
                      {role === "MODERATOR" &&
                        "Can moderate comments and view published resources."}
                      {role === "AUTHOR" &&
                        "Can write articles and manage their own portfolio entries."}
                      {role === "USER" &&
                        "Standard member with subscription and interaction rights."}
                    </p>
                  </div>
                  <div
                    className={`flex size-4 items-center justify-center rounded-full border ${
                      roleToAssign === role
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/40"
                    }`}
                  >
                    {roleToAssign === role && (
                      <div className="size-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRoleDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleRoleChangeConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? "Updating..." : "Save Role Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: User Account Details ─────────────────────────────────── */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <User className="size-4 text-primary" />
              <span>User Profile Overview</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Complete account metadata for{" "}
              <span className="font-semibold text-foreground">
                {targetUser?.name}
              </span>
              .
            </DialogDescription>
          </DialogHeader>

          {targetUser && (
            <div className="space-y-4 py-2 text-xs">
              <div className="space-y-3 rounded-xl border border-border/80 bg-muted/40 p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="size-12 rounded-xl border border-border bg-muted">
                    <AvatarImage
                      src={targetUser.avatar || undefined}
                      alt={targetUser.name}
                    />
                    <AvatarFallback className="text-sm font-bold">
                      {targetUser.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid">
                    <span className="text-sm font-bold text-foreground">
                      {targetUser.name}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      @{targetUser.username}
                    </span>
                    <span className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                      {targetUser.email}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-border/60 pt-2 text-muted-foreground">
                  <div>
                    <span className="text-[10px] font-semibold text-foreground/70 uppercase">
                      Assigned Role
                    </span>
                    <p className="font-mono font-medium text-foreground uppercase">
                      {targetUser.role}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-foreground/70 uppercase">
                      Email Verification
                    </span>
                    <p
                      className={
                        targetUser.isEmailVerified
                          ? "text-emerald-600"
                          : "text-amber-600"
                      }
                    >
                      {targetUser.isEmailVerified ? "Verified" : "Unverified"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-foreground/70 uppercase">
                      Created Date
                    </span>
                    <p>
                      {targetUser.createdAt
                        ? new Date(targetUser.createdAt).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-foreground/70 uppercase">
                      Newsletter
                    </span>
                    <p>
                      {targetUser.subscribedToNewsletter
                        ? "Subscribed"
                        : "Opted Out"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDetailsOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Delete User Confirmation ─────────────────────────────── */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base text-destructive">
              <Trash2 className="size-4" />
              <span>Confirm User Account Deletion</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete user account{" "}
              <span className="font-semibold text-foreground">
                {targetUser?.email}
              </span>
              ? This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteUserConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? "Deleting..." : "Permanently Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
