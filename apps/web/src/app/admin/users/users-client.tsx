"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  User,
  Mail,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Copy,
  CheckCircle2,
  MoreHorizontal,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

type UserData = {
  id: string;
  email: string;
  username: string;
  displayUsername: string;
  image: string | null;
  emailVerified: boolean;
  createdAt: string | Date;
  role: string | null;
  banned: boolean | null;
};

export function UsersClient({ users }: { users: UserData[] }) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [copied, setCopied] = React.useState(false);

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(users.map((u) => u.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleOne = (id: string, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) next.add(id);
    else next.delete(id);
    setSelectedIds(next);
  };

  const copySelectedIds = () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds).join(", ");
    navigator.clipboard.writeText(ids);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast("User ID copied to clipboard");
  };

  const handleSetRole = async (userId: string, role: "user" | "admin") => {
    try {
      await authClient.admin.setRole({ userId, role });
      toast.success(`Role updated to ${role}`);
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Failed to update role");
    }
  };

  const handleBan = async (userId: string) => {
    try {
      await authClient.admin.banUser({ userId, banReason: "Admin action" });
      toast.success("User banned");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Failed to ban user");
    }
  };

  const handleUnban = async (userId: string) => {
    try {
      await authClient.admin.unbanUser({ userId });
      toast.success("User unbanned");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Failed to unban user");
    }
  };

  const handleImpersonate = async (userId: string) => {
    try {
      await authClient.admin.impersonateUser({ userId });
      toast.success("Impersonating user...");
      window.location.href = "/";
    } catch (e: any) {
      toast.error(e.message || "Failed to impersonate user");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between p-2 bg-muted/50 border rounded-lg animate-in fade-in slide-in-from-top-2">
          <span className="text-sm font-medium ml-2">{selectedIds.size} user(s) selected</span>
          <Button variant="secondary" size="sm" onClick={copySelectedIds} className="h-8">
            {copied ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" /> Copy IDs
              </>
            )}
          </Button>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted">
            <TableRow>
              <TableHead className="w-[50px] text-center">
                <Checkbox
                  checked={users.length > 0 && selectedIds.size === users.length}
                  onCheckedChange={(val) => toggleAll(!!val)}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="w-[250px]">User</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user.id}
                data-state={selectedIds.has(user.id) ? "selected" : undefined}
                className={user.banned ? "opacity-60 bg-destructive/5" : ""}
              >
                <TableCell className="text-center">
                  <Checkbox
                    checked={selectedIds.has(user.id)}
                    onCheckedChange={(val) => toggleOne(user.id, !!val)}
                    aria-label="Select user"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-muted/50">
                      {user.image && <AvatarImage src={user.image} alt={user.username} />}
                      <AvatarFallback className="bg-muted/50 text-muted-foreground text-xs">
                        {user.displayUsername.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium leading-none">
                      {user.displayUsername} {user.banned && "(Banned)"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">@{user.username}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                    {user.role || "user"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.emailVerified ? (
                    <Badge
                      variant="secondary"
                      className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20 shadow-none font-medium"
                    >
                      <ShieldCheck className="mr-1 h-3 w-3" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-amber-600 border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20 shadow-none font-medium"
                    >
                      <ShieldAlert className="mr-1 h-3 w-3" />
                      Unverified
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(user.createdAt), "MMM d, yyyy")}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button variant="ghost" className="h-8 w-8 p-0" />}
                    >
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleCopyId(user.id)}>
                          Copy user ID
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        {user.role !== "admin" ? (
                          <DropdownMenuItem onClick={() => handleSetRole(user.id, "admin")}>
                            Make Admin
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleSetRole(user.id, "user")}>
                            Remove Admin
                          </DropdownMenuItem>
                        )}
                        {user.banned ? (
                          <DropdownMenuItem
                            onClick={() => handleUnban(user.id)}
                            className="text-green-600"
                          >
                            Unban User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleBan(user.id)}
                            className="text-red-600"
                          >
                            Ban User
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleImpersonate(user.id)}>
                          Impersonate
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <User className="h-6 w-6 text-muted-foreground/50" />
                    <p>No users found.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {users.length} of {users.length} users.
        </div>
      </div>
    </div>
  );
}
