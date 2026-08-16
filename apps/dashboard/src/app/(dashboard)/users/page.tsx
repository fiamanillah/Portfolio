"use client";

import * as React from "react";
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  Search,
  RefreshCw,
  MoreVertical,
  Trash2,
  UserCheck,
  UserX,
  CheckCircle2,
  Clock,
  Sparkles,
  Shield,
  Filter,
} from "lucide-react";

import type { AuthUser, Role } from "@workspace/shared";
import { UserApi } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { toast } from "@workspace/ui/components/sonner";

const ROLE_OPTIONS: Role[] = ["ADMIN", "MODERATOR", "AUTHOR", "USER"];

export default function UsersManagementPage() {
  const { user: currentAdmin } = useAuth();

  const [users, setUsers] = React.useState<AuthUser[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedRoleFilter, setSelectedRoleFilter] = React.useState<string>("ALL");

  // Selected user for role change or delete
  const [targetUser, setTargetUser] = React.useState<AuthUser | null>(null);
  const [roleToAssign, setRoleToAssign] = React.useState<Role>("USER");
  const [isRoleDialogOpen, setIsRoleDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const fetchUsers = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await UserApi.listUsersAdmin({
        search: searchQuery || undefined,
        role: selectedRoleFilter !== "ALL" ? selectedRoleFilter : undefined,
      });

      if (res.success && res.data) {
        setUsers(res.data);
      } else {
        toast.error("Failed to load user list", {
          description: res.error || "Please ensure the backend API is connected.",
        });
      }
    } catch (err: any) {
      toast.error("Error loading users", {
        description: err?.message || "Network issue.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedRoleFilter]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChangeConfirm = async () => {
    if (!targetUser) return;

    if (targetUser.id === currentAdmin?.id && roleToAssign !== "ADMIN") {
      toast.error("Self-demotion blocked", {
        description: "You cannot revoke your own Super Administrator role.",
      });
      setIsRoleDialogOpen(false);
      return;
    }

    try {
      setIsProcessing(true);
      const res = await UserApi.updateUserRole(targetUser.id, roleToAssign);

      if (res.success) {
        toast.success(`Role updated successfully`, {
          description: `${targetUser.name}'s role was updated to ${roleToAssign}.`,
        });
        setIsRoleDialogOpen(false);
        fetchUsers();
      } else {
        toast.error("Role update failed", {
          description: res.error || "Unable to modify user permissions.",
        });
      }
    } catch (err: any) {
      toast.error("Error updating role", {
        description: err?.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteUserConfirm = async () => {
    if (!targetUser) return;

    if (targetUser.id === currentAdmin?.id) {
      toast.error("Action Prohibited", {
        description: "You cannot delete your own active administrator account.",
      });
      setIsDeleteDialogOpen(false);
      return;
    }

    try {
      setIsProcessing(true);
      const res = await UserApi.deleteUser(targetUser.id);

      if (res.success) {
        toast.success("User account deleted", {
          description: `Successfully deleted user ${targetUser.email}.`,
        });
        setIsDeleteDialogOpen(false);
        fetchUsers();
      } else {
        toast.error("Deletion failed", {
          description: res.error || "Failed to remove user record.",
        });
      }
    } catch (err: any) {
      toast.error("Error deleting user", {
        description: err?.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Metric counts
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const modCount = users.filter((u) => u.role === "MODERATOR").length;
  const memberCount = users.filter((u) => u.role === "USER" || u.role === "AUTHOR").length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              User & Role Management
            </h1>
            <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
              RBAC Control
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Super Administrator console to inspect users, assign roles (Admin, Moderator, Author, User), and manage platform access.
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
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/80 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Accounts
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Registered portfolio users</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Super Admins
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <ShieldCheck className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">{adminCount}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Full console authorization</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Moderators
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <ShieldAlert className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{modCount}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Content & comments stewards</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Standard Members
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <UserCheck className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{memberCount}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Community & subscribers</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table Card */}
      <Card className="border-border/80">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Platform Users & Roles
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time RBAC list with granular privilege management.
              </CardDescription>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search name, email, user..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-xs h-8"
                />
              </div>

              <div className="flex items-center gap-1 bg-muted/40 p-0.5 rounded-lg border border-border">
                {["ALL", "ADMIN", "MODERATOR", "USER"].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRoleFilter(role)}
                    className={`px-2.5 py-1 text-[11px] rounded-md font-medium transition-all ${
                      selectedRoleFilter === role
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">User</TableHead>
                <TableHead>Email & Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden md:table-cell">Created</TableHead>
                <TableHead className="pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-xs text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="size-5 animate-spin text-primary" />
                      <span>Loading user records...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-xs text-muted-foreground">
                    No users matching criteria.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => {
                  const isCurrent = u.id === currentAdmin?.id;

                  return (
                    <TableRow key={u.id} className={isCurrent ? "bg-primary/5" : ""}>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8 rounded-lg border border-border">
                            <AvatarImage src={u.avatar || undefined} alt={u.name} />
                            <AvatarFallback className="text-[11px] font-bold">
                              {u.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="grid leading-tight">
                            <div className="flex items-center gap-1.5 font-medium text-xs">
                              <span>{u.name}</span>
                              {isCurrent && (
                                <Badge variant="secondary" className="text-[9px] px-1 h-4">
                                  You
                                </Badge>
                              )}
                            </div>
                            <span className="text-[11px] text-muted-foreground font-mono">
                              @{u.username}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="grid leading-tight">
                          <span className="text-xs font-mono">{u.email}</span>
                          <div className="flex items-center gap-1 mt-0.5">
                            {u.isEmailVerified ? (
                              <span className="flex items-center text-[10px] text-emerald-500 font-medium">
                                <CheckCircle2 className="size-2.5 mr-0.5" />
                                Verified
                              </span>
                            ) : (
                              <span className="flex items-center text-[10px] text-amber-500">
                                <Clock className="size-2.5 mr-0.5" />
                                Unverified
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            u.role === "ADMIN"
                              ? "default"
                              : u.role === "MODERATOR"
                              ? "secondary"
                              : "outline"
                          }
                          className="font-mono text-[10px] uppercase"
                        >
                          {u.role || "USER"}
                        </Badge>
                      </TableCell>

                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </TableCell>

                      <TableCell className="pr-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreVertical className="size-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel className="text-xs">
                              Manage User
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => {
                                setTargetUser(u);
                                setRoleToAssign((u.role as Role) || "USER");
                                setIsRoleDialogOpen(true);
                              }}
                              className="text-xs gap-2"
                            >
                              <Shield className="size-3.5 text-primary" />
                              Change Role
                            </DropdownMenuItem>

                            {!isCurrent && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setTargetUser(u);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                  className="text-xs gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                                >
                                  <Trash2 className="size-3.5" />
                                  Delete Account
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Role Change Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <Shield className="size-4 text-primary" />
              <span>Modify User Role & Privileges</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Assign a new role to{" "}
              <span className="font-semibold text-foreground">{targetUser?.name}</span> (
              {targetUser?.email}).
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
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                    roleToAssign === role
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border/80 bg-background/50 hover:bg-muted"
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-medium text-xs uppercase flex items-center gap-1.5">
                      <span>{role}</span>
                      {role === "ADMIN" && (
                        <Badge variant="default" className="text-[9px] h-4">
                          Full Access
                        </Badge>
                      )}
                      {role === "MODERATOR" && (
                        <Badge variant="secondary" className="text-[9px] h-4">
                          Moderation
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {role === "ADMIN" && "Full administrative power over users, templates, comments, and settings."}
                      {role === "MODERATOR" && "Can moderate comments and view published resources."}
                      {role === "AUTHOR" && "Can write articles and manage their own portfolio entries."}
                      {role === "USER" && "Standard member with subscription and interaction rights."}
                    </p>
                  </div>
                  <div
                    className={`size-4 rounded-full border flex items-center justify-center ${
                      roleToAssign === role
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/40"
                    }`}
                  >
                    {roleToAssign === role && <div className="size-1.5 rounded-full bg-white" />}
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

      {/* Delete User Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2 text-destructive">
              <Trash2 className="size-4" />
              <span>Confirm User Account Deletion</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete user account{" "}
              <span className="font-semibold text-foreground">{targetUser?.email}</span>?
              This action is permanent and cannot be undone.
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
  );
}
