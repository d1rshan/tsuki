"use client";

import { format } from "date-fns";
import { User, Mail, Calendar, ShieldCheck, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authClient } from "@/lib/auth-client";
import { AdminUserRowActions } from "./admin-user-row-actions";

export type UserData = typeof authClient.$Infer.Session.user;

export function AdminUsersTable({ users }: { users: UserData[] }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <AdminUsersTableHeader />
          <TableBody>
            {users.map((user) => (
              <UserTableRow key={user.id} user={user} />
            ))}
            {users.length === 0 && <AdminUsersTableEmptyState />}
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

// --- SUB-COMPONENTS ---

function AdminUsersTableHeader() {
  return (
    <TableHeader className="sticky top-0 z-10 bg-muted">
      <TableRow>
        <TableHead className="w-[250px]">User</TableHead>
        <TableHead>Username</TableHead>
        <TableHead>Email</TableHead>
        <TableHead>Role</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Joined</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}

function UserTableRow({ user }: { user: UserData }) {
  return (
    <TableRow className={user.banned ? "opacity-60 bg-destructive/5" : ""}>
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
        <AdminUserRowActions user={user} />
      </TableCell>
    </TableRow>
  );
}

function AdminUsersTableEmptyState() {
  return (
    <TableRow>
      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
        <div className="flex flex-col items-center justify-center gap-2">
          <User className="h-6 w-6 text-muted-foreground/50" />
          <p>No users found.</p>
        </div>
      </TableCell>
    </TableRow>
  );
}
