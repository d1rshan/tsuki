"use client";

import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  const handleCopyId = () => {
    navigator.clipboard.writeText(user.id);
    toast("User ID copied to clipboard");
  };

  const handleSetRole = async (role: "user" | "admin") => {
    try {
      await authClient.admin.setRole({ userId: user.id, role });
      toast.success(`Role updated to ${role}`);
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Failed to update role");
    }
  };

  const handleBan = async () => {
    try {
      await authClient.admin.banUser({ userId: user.id, banReason: "Admin action" });
      toast.success("User banned");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Failed to ban user");
    }
  };

  const handleUnban = async () => {
    try {
      await authClient.admin.unbanUser({ userId: user.id });
      toast.success("User unbanned");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Failed to unban user");
    }
  };

  const handleImpersonate = async () => {
    try {
      await authClient.admin.impersonateUser({ userId: user.id });
      toast.success("Impersonating user...");
      window.location.href = "/";
    } catch (e: any) {
      toast.error(e.message || "Failed to impersonate user");
    }
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
          {user.role !== "admin" ? (
            <DropdownMenuItem onClick={() => handleSetRole("admin")}>Make Admin</DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => handleSetRole("user")}>Remove Admin</DropdownMenuItem>
          )}
          {user.banned ? (
            <DropdownMenuItem onClick={handleUnban} className="text-green-600">
              Unban User
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={handleBan} className="text-red-600">
              Ban User
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleImpersonate}>Impersonate</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
