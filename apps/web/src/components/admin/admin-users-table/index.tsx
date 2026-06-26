"use client";

import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { authClient } from "@/lib/auth-client";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import type { PaginationState } from "@tanstack/react-table";

export type UserData = typeof authClient.$Infer.Session.user;

export function AdminUsersTable({
  users,
  hasMore = false,
}: {
  users: UserData[];
  hasMore?: boolean;
}) {
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: false, history: "push" }),
  );

  const [limit, setLimit] = useQueryState(
    "limit",
    parseAsInteger.withDefault(10).withOptions({ shallow: false, history: "push" }),
  );

  const [q, setQ] = useQueryState(
    "q",
    parseAsString.withDefault("").withOptions({ shallow: false, history: "push", throttleMs: 500 }),
  );

  const pagination = {
    pageIndex: page - 1,
    pageSize: limit,
  };

  const handlePaginationChange = (updaterOrValue: any) => {
    const newPagination =
      typeof updaterOrValue === "function" ? updaterOrValue(pagination) : updaterOrValue;

    setPage(newPagination.pageIndex + 1);
    setLimit(newPagination.pageSize);
  };

  const handleSearchChange = (val: string) => {
    setQ(val || null);
    setPage(1);
  };

  return (
    <DataTable
      columns={columns}
      data={users}
      searchKey="email"
      searchPlaceholder="Search users by username or email..."
      searchValue={q}
      onSearchChange={handleSearchChange}
      manualPagination={true}
      // if hasMore is true, we allow next page by setting pageCount to -1
      pageCount={hasMore ? -1 : page}
      pagination={pagination}
      onPaginationChange={handlePaginationChange}
    />
  );
}
