"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  ArrowUpDown,
  Ban,
  Calendar,
  CheckCircle2,
  Mail,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdminUserActionsMenu } from "./admin-user-actions-menu";

// Replace this with the actual UserData import from wherever it's centrally located if needed
// For now, importing from index.tsx or using the same type definition
import type { UserData } from "./index";

export const columns: ColumnDef<UserData>[] = [
  {
    accessorKey: "displayUsername",
    header: "User",
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
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="h-4 w-4" />
          <span>{row.getValue("email")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <Badge variant={role === "admin" ? "default" : "outline"} className="capitalize">
          {role === "admin" ? (
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
    cell: ({ row }) => <AdminUserActionsMenu user={row.original} />,
  },
];
