"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef, type PaginationState, type Updater } from "@tanstack/react-table";
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
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { toast } from "sonner";

import { authClient } from "@tsuki/auth/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDebounce } from "@/hooks/use-debounce";
import { isAdmin } from "@/modules/admin/lib/admin";
import { cn } from "@/lib/utils";

type UserData = typeof authClient.$Infer.Session.user;
type AdminUsersData = {
  total: number;
  users: UserData[];
};

const ADMIN_USERS_QUERY_KEY = "admin-users";

export function AdminUsersTable() {
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ history: "push" }),
  );

  const [limit, setLimit] = useQueryState(
    "limit",
    parseAsInteger.withDefault(10).withOptions({ history: "push" }),
  );

  const [q, setQ] = useQueryState("q", parseAsString.withDefault(""));

  const [inputValue, setInputValue] = useState(q);
  const debouncedInputValue = useDebounce(inputValue, 500);

  useEffect(() => {
    if (debouncedInputValue !== q) {
      setQ(debouncedInputValue || null);
      setPage(1);
    }
  }, [debouncedInputValue, q, setQ, setPage]);

  const {
    data: { users = [], total = 0 } = {},
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: [ADMIN_USERS_QUERY_KEY, page, limit, q],
    queryFn: () => listUsers({ page, limit, q }),
    placeholderData: (prev) => prev,
  });

  useEffect(() => {
    if (isError && error) {
      toast.error(error.message || "An error occurred while fetching users.");
    }
  }, [isError, error]);

  const pagination = {
    pageIndex: page - 1,
    pageSize: limit,
  };
  const columns = getColumns();

  const handlePaginationChange = (updaterOrValue: Updater<PaginationState>) => {
    const newPagination =
      typeof updaterOrValue === "function" ? updaterOrValue(pagination) : updaterOrValue;

    setPage(newPagination.pageIndex + 1);
    setLimit(newPagination.pageSize);
  };

  return (
    <div className={cn("transition-opacity duration-200", isFetching && "opacity-50")}>
      <DataTable
        columns={columns}
        data={users}
        searchKey="email"
        searchPlaceholder="Username or email..."
        searchValue={inputValue}
        onSearchChange={setInputValue}
        manualPagination={true}
        pageCount={Math.ceil(total / limit)}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
      />
    </div>
  );
}

async function listUsers({
  page,
  limit,
  q,
}: {
  page: number;
  limit: number;
  q: string;
}): Promise<AdminUsersData> {
  const res = await authClient.admin.listUsers({
    query: {
      limit,
      offset: (page - 1) * limit,
      ...(q ? { searchValue: q } : {}),
    },
  });

  if (res.error) {
    throw new Error(res.error.message || "Failed to fetch users");
  }

  return {
    users: res.data?.users ?? [],
    total: res.data?.total ?? 0,
  };
}

function getColumns(): ColumnDef<UserData>[] {
  return [
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
              <AvatarFallback className="bg-muted/50 text-xs text-muted-foreground">
                {getInitial(user)}
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
      cell: ({ row }) => <BanBadge banned={row.getValue("banned")} />,
    },
    {
      accessorKey: "emailVerified",
      header: "Status",
      cell: ({ row }) => <VerificationBadge verified={row.getValue("emailVerified")} />,
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => <JoinedDate date={row.getValue("createdAt")} />,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => <AdminUserActionsMenu user={row.original} />,
    },
  ];
}

function getInitial(user: UserData) {
  return (user.displayUsername || user.name || "U").charAt(0).toUpperCase();
}

function EmailCell({ email }: { email: unknown }) {
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(String(email));
        toast.success("Email copied to clipboard");
      }}
      className="group flex cursor-pointer items-center gap-2 text-left text-muted-foreground transition-colors hover:text-foreground"
    >
      <Mail className="h-4 w-4 shrink-0" />
      <span className="truncate group-hover:underline group-hover:decoration-dashed group-hover:underline-offset-4">
        {String(email)}
      </span>
    </button>
  );
}

function RoleBadge({ role }: { role: unknown }) {
  const value = typeof role === "string" ? role : "user";

  return (
    <Badge variant={isAdmin(value) ? "default" : "outline"} className="capitalize">
      {isAdmin(value) ? <Shield className="mr-1 h-3 w-3" /> : <User className="mr-1 h-3 w-3" />}
      {value}
    </Badge>
  );
}

function BanBadge({ banned }: { banned: unknown }) {
  return banned ? (
    <Badge variant="destructive">
      <Ban className="mr-1 h-3 w-3" /> Banned
    </Badge>
  ) : (
    <Badge variant="outline">
      <CheckCircle2 className="mr-1 h-3 w-3" /> Active
    </Badge>
  );
}

function VerificationBadge({ verified }: { verified: unknown }) {
  return verified ? (
    <Badge variant="outline">
      <ShieldCheck className="mr-1 h-3 w-3" /> Verified
    </Badge>
  ) : (
    <Badge variant="secondary">
      <ShieldAlert className="mr-1 h-3 w-3" /> Unverified
    </Badge>
  );
}

function JoinedDate({ date }: { date: unknown }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Calendar className="h-4 w-4" />
      <span>{format(new Date(String(date)), "MMM d, yyyy")}</span>
    </div>
  );
}

function AdminUserActionsMenu({ user }: { user: UserData }) {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const sessionUser = session?.user;

  const isSelf = sessionUser?.id === user.id;
  const canModifyRole = !isSelf && sessionUser?.role === "owner";
  const canManageUser =
    !isSelf &&
    (sessionUser?.role === "owner" || (sessionUser?.role === "admin" && !isAdmin(user.role)));

  const refreshUsers = () => queryClient.invalidateQueries({ queryKey: [ADMIN_USERS_QUERY_KEY] });

  const runAction = async (
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
        <span className="sr-only">Open menu</span>
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => {
              navigator.clipboard.writeText(user.id);
              toast("User ID copied to clipboard");
            }}
          >
            Copy user ID
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {isAdmin(user.role) ? (
            <DropdownMenuItem
              onClick={() =>
                runAction(
                  () => authClient.admin.setRole({ userId: user.id, role: "user" }),
                  "Role updated to user",
                  "Failed to update role",
                )
              }
              disabled={!canModifyRole}
            >
              Remove Admin
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() =>
                runAction(
                  () => authClient.admin.setRole({ userId: user.id, role: "admin" }),
                  "Role updated to admin",
                  "Failed to update role",
                )
              }
              disabled={!canModifyRole}
            >
              Make Admin
            </DropdownMenuItem>
          )}
          {user.banned ? (
            <DropdownMenuItem
              onClick={() =>
                runAction(
                  () => authClient.admin.unbanUser({ userId: user.id }),
                  "User unbanned",
                  "Failed to unban user",
                )
              }
              disabled={!canManageUser}
              className={canManageUser ? "text-green-600" : undefined}
            >
              Unban User
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() =>
                runAction(
                  () => authClient.admin.banUser({ userId: user.id, banReason: "Admin action" }),
                  "User banned",
                  "Failed to ban user",
                )
              }
              disabled={!canManageUser}
              className={canManageUser ? "text-red-600" : undefined}
            >
              Ban User
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={async () => {
              const { error } = await authClient.admin.impersonateUser({ userId: user.id });

              if (error) {
                toast.error(error.message || "Failed to impersonate user");
                return;
              }

              toast.success("Impersonating user...");
              window.location.href = "/";
            }}
            disabled={!canManageUser}
          >
            Impersonate
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
