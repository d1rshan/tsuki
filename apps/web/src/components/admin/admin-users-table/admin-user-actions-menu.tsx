"use client";

import { MoreHorizontal } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

import { type UserData } from "./index";

type AdminUserActionsMenuProps = {
  user: UserData;
};

export function AdminUserActionsMenu({ user }: AdminUserActionsMenuProps) {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();

  const currentUserRole = session?.user?.role;
  const isSelf = session?.user?.id === user.id;

  // Proper RBAC hierarchy:
  // 1. You cannot modify yourself.
  // 2. Only an 'owner' can change someone's role.
  // 3. An 'admin' can only ban/unban regular users (not other admins or owners).
  const canModifyRole = !isSelf && currentUserRole === "owner";

  const canBanOrUnban =
    !isSelf &&
    (currentUserRole === "owner" ||
      (currentUserRole === "admin" && user.role !== "admin" && user.role !== "owner"));

  const canImpersonate =
    !isSelf &&
    (currentUserRole === "owner" ||
      (currentUserRole === "admin" && user.role !== "admin" && user.role !== "owner"));

  const handleCopyId = () => {
    navigator.clipboard.writeText(user.id);
    toast("User ID copied to clipboard");
  };

  const handleSetRole = async (role: "user" | "admin") => {
    const { error } = await authClient.admin.setRole({ userId: user.id, role });
    if (error) {
      toast.error(error.message || "Failed to update role");
      return;
    }
    toast.success(`Role updated to ${role}`);
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
  };

  const handleBan = async () => {
    const { error } = await authClient.admin.banUser({
      userId: user.id,
      banReason: "Admin action",
    });
    if (error) {
      toast.error(error.message || "Failed to ban user");
      return;
    }
    toast.success("User banned");
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
  };

  const handleUnban = async () => {
    const { error } = await authClient.admin.unbanUser({ userId: user.id });
    if (error) {
      toast.error(error.message || "Failed to unban user");
      return;
    }
    toast.success("User unbanned");
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
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
          {user.role !== "admin" && user.role !== "owner" ? (
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
              disabled={!canBanOrUnban}
              className={canBanOrUnban ? "text-green-600" : ""}
            >
              Unban User
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={handleBan}
              disabled={!canBanOrUnban}
              className={canBanOrUnban ? "text-red-600" : ""}
            >
              Ban User
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleImpersonate} disabled={!canImpersonate}>
            Impersonate
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
