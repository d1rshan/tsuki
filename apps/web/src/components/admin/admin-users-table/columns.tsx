"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  Ban,
  Calendar,
  CheckCircle2,
  Mail,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { AdminUserActionsMenu } from "./admin-user-actions-menu";
import type { UserData } from "./index";

export const columns: ColumnDef<UserData>[] = [
  {
    accessorKey: "displayUsername",
    header: "User",
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-muted/50">
            {user.image && <AvatarImage src={user.image} alt={user.username ?? ""} />}
            <AvatarFallback className="bg-muted/50 text-muted-foreground text-xs">
              {(user.displayUsername || user.name || "U").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium leading-none">{user.displayUsername}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.getValue("email") as string;
      return (
        <button
          onClick={() => {
            navigator.clipboard.writeText(email);
            toast.success("Email copied to clipboard");
          }}
          className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-left"
        >
          <Mail className="h-4 w-4 shrink-0" />
          <span className="truncate group-hover:underline group-hover:decoration-dashed group-hover:underline-offset-4">
            {email}
          </span>
        </button>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <Badge
          variant={role === "admin" || role === "owner" ? "default" : "outline"}
          className="capitalize"
        >
          {role === "admin" || role === "owner" ? (
            <Shield className="mr-1 h-3 w-3" />
          ) : (
            <User className="mr-1 h-3 w-3" />
          )}
          {role || "user"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "banned",
    header: "Banned",
    cell: ({ row }) => {
      const isBanned = row.getValue("banned") as boolean;
      return isBanned ? (
        <Badge variant="destructive">
          <Ban className="mr-1 h-3 w-3" /> Banned
        </Badge>
      ) : (
        <Badge variant="outline">
          <CheckCircle2 className="mr-1 h-3 w-3" /> Active
        </Badge>
      );
    },
  },
  {
    accessorKey: "emailVerified",
    header: "Status",
    cell: ({ row }) => {
      const isVerified = row.getValue("emailVerified") as boolean;
      return isVerified ? (
        <Badge variant="outline">
          <ShieldCheck className="mr-1 h-3 w-3" /> Verified
        </Badge>
      ) : (
        <Badge variant="secondary">
          <ShieldAlert className="mr-1 h-3 w-3" /> Unverified
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as Date;
      return (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(createdAt), "MMM d, yyyy")}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <AdminUserActionsMenu user={row.original} />,
  },
];
