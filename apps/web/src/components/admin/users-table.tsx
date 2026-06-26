"use client";

import * as React from "react";
import { format } from "date-fns";
import { User, Mail, Calendar, ShieldCheck, ShieldAlert, Copy, CheckCircle2 } from "lucide-react";

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
import { authClient } from "@/lib/auth-client";
import { UserRowActions } from "./user-row-actions";

export type UserData = typeof authClient.$Infer.Session.user;

export function UsersTable({ users }: { users: UserData[] }) {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [copied, setCopied] = React.useState(false);

  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? new Set(users.map((u) => u.id)) : new Set());
  };

  const toggleOne = (id: string, checked: boolean) => {
    const next = new Set(selectedIds);
    checked ? next.add(id) : next.delete(id);
    setSelectedIds(next);
  };

  const copySelectedIds = () => {
    if (selectedIds.size === 0) return;
    navigator.clipboard.writeText(Array.from(selectedIds).join(", "));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
                      {user.image && <AvatarImage src={user.image} alt={user.username ?? ""} />}
                      <AvatarFallback className="bg-muted/50 text-muted-foreground text-xs">
                        {(user.displayUsername || user.name || "U").charAt(0).toUpperCase()}
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
                      <ShieldCheck className="mr-1 h-3 w-3" /> Verified
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-amber-600 border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20 shadow-none font-medium"
                    >
                      <ShieldAlert className="mr-1 h-3 w-3" /> Unverified
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
                  <UserRowActions user={user} />
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
