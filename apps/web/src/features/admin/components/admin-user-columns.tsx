"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  Ban,
  Calendar,
  CheckCircle2,
  Mail,
  MoreHorizontal,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@tsuki/auth/client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { isAdminRole } from "../permissions";
import { adminKeys } from "../query-keys";
import type { AdminUser } from "../types";

type AdminAction = () => Promise<{ error: { message?: string | null } | null }>;

export const adminUserColumns: ColumnDef<AdminUser>[] = [
  {
    accessorKey: "displayUsername",
    header: "User",
    enableHiding: false,
    cell: ({ row }) => <UserCell user={row.original} />,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <span className="font-medium">{row.getValue("name")}</span>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <EmailCell email={row.getValue("email")} />,
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => <RoleBadge role={row.getValue("role")} />,
  },
  {
    accessorKey: "banned",
    header: "Banned",
    cell: ({ row }) => <BanBadge isBanned={row.getValue("banned")} />,
  },
  {
    accessorKey: "emailVerified",
    header: "Status",
    cell: ({ row }) => <VerificationBadge isVerified={row.getValue("emailVerified")} />,
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => <JoinedDate date={row.getValue("createdAt")} />,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <AdminUserActions user={row.original} />,
  },
];

function UserCell({ user }: { user: AdminUser }) {
  const initial = (user.displayUsername || user.name || "U").charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <Avatar className="size-9">
        {user.image ? <AvatarImage src={user.image} alt="" /> : null}
        <AvatarFallback className="text-xs">{initial}</AvatarFallback>
      </Avatar>
      <span className="font-medium">{user.displayUsername}</span>
    </div>
  );
}

function EmailCell({ email }: { email: string }) {
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(email);
        toast.success("Email copied");
      }}
      className="flex items-center gap-2 text-left text-muted-foreground hover:text-foreground"
      aria-label={`Copy ${email}`}
    >
      <Mail className="size-4 shrink-0" />
      <span className="truncate">{email}</span>
    </button>
  );
}

function RoleBadge({ role }: { role?: string | null }) {
  const value = role || "user";

  return (
    <Badge variant={isAdminRole(value) ? "default" : "outline"} className="capitalize">
      {isAdminRole(value) ? <Shield /> : <User />}
      {value}
    </Badge>
  );
}

function BanBadge({ isBanned }: { isBanned: boolean }) {
  return isBanned ? (
    <Badge variant="destructive">
      <Ban /> Banned
    </Badge>
  ) : (
    <Badge variant="outline">
      <CheckCircle2 /> Active
    </Badge>
  );
}

function VerificationBadge({ isVerified }: { isVerified: boolean }) {
  return isVerified ? (
    <Badge variant="outline">
      <ShieldCheck /> Verified
    </Badge>
  ) : (
    <Badge variant="secondary">
      <ShieldAlert /> Unverified
    </Badge>
  );
}

function JoinedDate({ date }: { date: Date | string }) {
  return (
    <span className="flex items-center gap-2 text-muted-foreground">
      <Calendar className="size-4" />
      {format(new Date(date), "MMM d, yyyy")}
    </span>
  );
}

function AdminUserActions({ user }: { user: AdminUser }) {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const currentUser = session?.user;
  const isSelf = currentUser?.id === user.id;
  const isPrivileged = isAdminRole(user.role);
  const canChangeRole = !isSelf && currentUser?.role === "owner";
  const canManage =
    !isSelf && (currentUser?.role === "owner" || (currentUser?.role === "admin" && !isPrivileged));

  async function run(action: AdminAction, successMessage: string, errorMessage: string) {
    const { error } = await action();
    if (error) {
      toast.error(error.message || errorMessage);
      return;
    }

    toast.success(successMessage);
    await queryClient.invalidateQueries({ queryKey: adminKeys.users.all });
  }

  const roleAction = isPrivileged
    ? () => authClient.admin.setRole({ userId: user.id, role: "user" })
    : () => authClient.admin.setRole({ userId: user.id, role: "admin" });
  const banAction = user.banned
    ? () => authClient.admin.unbanUser({ userId: user.id })
    : () => authClient.admin.banUser({ userId: user.id, banReason: "Admin action" });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon-sm" />}
        aria-label={`Actions for ${user.displayUsername}`}
      >
        <MoreHorizontal />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={async () => {
              await navigator.clipboard.writeText(user.id);
              toast.success("User ID copied");
            }}
          >
            Copy user ID
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            disabled={!canChangeRole}
            onClick={() =>
              run(
                roleAction,
                isPrivileged ? "Admin role removed" : "Admin role granted",
                "Failed to update role",
              )
            }
          >
            {isPrivileged ? "Remove admin" : "Make admin"}
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!canManage}
            variant={user.banned ? "default" : "destructive"}
            onClick={() =>
              run(
                banAction,
                user.banned ? "User unbanned" : "User banned",
                user.banned ? "Failed to unban user" : "Failed to ban user",
              )
            }
          >
            {user.banned ? "Unban user" : "Ban user"}
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!canManage}
            onClick={async () => {
              const { error } = await authClient.admin.impersonateUser({ userId: user.id });
              if (error) {
                toast.error(error.message || "Failed to impersonate user");
                return;
              }

              window.location.assign("/");
            }}
          >
            Impersonate
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
