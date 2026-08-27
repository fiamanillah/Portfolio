"use client"

import * as React from "react"
import { Search, User, Loader2, Check, Users } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { UserApi } from "@/lib/api/user.api"
import type { AuthUser } from "@workspace/shared"

export interface AuthorSelectorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedAuthorId?: string | null
  onSelectUser: (user: AuthUser) => void
}

export function AuthorSelectorDialog({
  open,
  onOpenChange,
  selectedAuthorId,
  onSelectUser,
}: AuthorSelectorDialogProps) {
  const [search, setSearch] = React.useState("")
  const [users, setUsers] = React.useState<AuthUser[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [totalCount, setTotalCount] = React.useState(0)

  const fetchUsers = React.useCallback(async (query: string) => {
    setIsLoading(true)
    try {
      const res = await UserApi.listUsersAdmin({
        search: query.trim() || undefined,
        limit: 30,
        sortBy: "name",
        sortOrder: "asc",
      })
      if (res.success && Array.isArray(res.data)) {
        setUsers(res.data)
        setTotalCount(res.pagination?.total || res.data.length)
      }
    } catch {
      // Failed to load users
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    if (open) {
      fetchUsers(search)
    }
  }, [open, fetchUsers, search])

  const handleSelect = (user: AuthUser) => {
    onSelectUser(user)
    onOpenChange(false)
  }

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case "ADMIN":
        return "border-primary/40 bg-primary/15 text-primary"
      case "AUTHOR":
        return "border-emerald-500/40 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
      case "MODERATOR":
        return "border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-400"
      default:
        return "border-muted-foreground/30 bg-muted/30 text-muted-foreground"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        {/* Header */}
        <DialogHeader className="border-b border-border/80 p-4 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                Select Author Persona
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Assign a registered user as the verified author of this post.
              </DialogDescription>
            </div>
          </div>

          {/* Live Search Input */}
          <div className="relative mt-3">
            <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, @username, email, or headline..."
              className="h-9 bg-background pr-8 pl-9 text-xs"
              autoFocus
            />
            {isLoading && (
              <Loader2 className="absolute top-1/2 right-3 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>
        </DialogHeader>

        {/* User Results List */}
        <div className="max-h-[420px] min-h-[260px] flex-1 space-y-1.5 overflow-y-auto p-3">
          {isLoading && users.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="font-mono text-xs">
                Searching user registry...
              </span>
            </div>
          ) : users.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2 p-6 text-center text-muted-foreground">
              <User className="h-8 w-8 opacity-40" />
              <div className="text-xs font-semibold">
                No users matching &quot;{search}&quot;
              </div>
              <p className="max-w-xs text-[11px] text-muted-foreground">
                Try searching for a different name, email, or username.
              </p>
            </div>
          ) : (
            users.map((u) => {
              const isSelected = selectedAuthorId === u.id
              const initials = (u.name || u.username || "FA")
                .slice(0, 2)
                .toUpperCase()

              return (
                <div
                  key={u.id}
                  onClick={() => handleSelect(u)}
                  className={`group flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-2.5 text-xs transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-xs"
                      : "border-border/60 bg-background/50 hover:border-primary/50 hover:bg-muted/40"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="h-10 w-10 shrink-0 border border-primary/30">
                      <AvatarImage src={u.avatar || undefined} alt={u.name} />
                      <AvatarFallback className="font-mono text-xs font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-bold text-foreground">
                          {u.name}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          @{u.username}
                        </span>
                        <Badge
                          variant="outline"
                          className={`px-1 py-0 font-mono text-[9px] uppercase ${getRoleBadgeVariant(
                            u.role
                          )}`}
                        >
                          {u.role || "USER"}
                        </Badge>
                      </div>

                      <div className="truncate text-[11px] text-muted-foreground">
                        {u.headline || u.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {isSelected ? (
                      <span className="flex items-center gap-1 rounded-md border border-primary/30 bg-primary/15 px-2 py-1 font-mono text-[10px] font-semibold text-primary">
                        <Check className="h-3 w-3" /> Selected
                      </span>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2.5 text-[11px] opacity-80 transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:opacity-100"
                      >
                        Select
                      </Button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/80 bg-muted/20 px-4 py-2.5 font-mono text-[11px] text-muted-foreground">
          <span>
            {totalCount}{" "}
            {totalCount === 1 ? "registered user" : "registered users"}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-7 text-xs"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
