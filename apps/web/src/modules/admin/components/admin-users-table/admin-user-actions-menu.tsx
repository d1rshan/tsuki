"use client";

import { useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@tsuki/auth/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isAdmin } from "@/modules/admin/lib/admin";

import { type UserData } from "./index";

type AdminUserActionsMenuProps = {
  user: UserData;
};

export function AdminUserActionsMenu({ user }: AdminUserActionsMenuProps) {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();

  const currentUserRole = session?.user?.role;
  const isSelf = session?.user?.id === user.id;
  const isPrivilegedUser = isAdmin(user.role);
  const canModifyRole = !isSelf && currentUserRole === "owner";
  const canManageUser =
    !isSelf && (currentUserRole === "owner" || (currentUserRole === "admin" && !isPrivilegedUser));

  const handleCopyId = () => {
    navigator.clipboard.writeText(user.id);
    toast("User ID copied to clipboard");
  };

  const refreshUsers = () => queryClient.invalidateQueries({ queryKey: ["admin-users"] });

  const runAdminAction = async (
    action: () => Promise<{ error: { message?: string | null } | null }>,
    successMessage: string,
    errorMessage: string,
  ) => {
    const { error } = await action();

    if (error) {
      toast.error(error.message || errorMessage);
      return;
    }

    toast.success(successMessage);
    await refreshUsers();
  };

  const handleSetRole = (role: "user" | "admin") => {
    return runAdminAction(
      () => authClient.admin.setRole({ userId: user.id, role }),
      `Role updated to ${role}`,
      "Failed to update role",
    );
  };

  const handleBan = async () => {
    await runAdminAction(
      () =>
        authClient.admin.banUser({
          userId: user.id,
          banReason: "Admin action",
        }),
      "User banned",
      "Failed to ban user",
    );
  };

  const handleUnban = async () => {
    await runAdminAction(
      () => authClient.admin.unbanUser({ userId: user.id }),
      "User unbanned",
      "Failed to unban user",
    );
  };

  const handleImpersonate = async () => {
    const { error } = await authClient.admin.impersonateUser({ userId: user.id });
    if (error) {
      toast.error(error.message || "Failed to impersonate user");
      return;
    }
    toast.success("Impersonating user...");
    window.location.href = "/";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
        <span className="sr-only">Open menu</span>
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleCopyId}>Copy user ID</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {!isPrivilegedUser ? (
            <DropdownMenuItem onClick={() => handleSetRole("admin")} disabled={!canModifyRole}>
              Make Admin
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => handleSetRole("user")} disabled={!canModifyRole}>
              Remove Admin
            </DropdownMenuItem>
          )}
          {user.banned ? (
            <DropdownMenuItem
              onClick={handleUnban}
              disabled={!canManageUser}
              className={canManageUser ? "text-green-600" : ""}
            >
              Unban User
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={handleBan}
              disabled={!canManageUser}
              className={canManageUser ? "text-red-600" : ""}
            >
              Ban User
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleImpersonate} disabled={!canManageUser}>
            Impersonate
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
