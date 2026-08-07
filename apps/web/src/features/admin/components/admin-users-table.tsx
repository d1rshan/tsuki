"use client";

import { useEffect } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { PaginationState, Updater } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { toast } from "sonner";

import { authClient } from "@tsuki/auth/client";

import { DataTable } from "@/components/ui/data-table";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";

import { adminKeys } from "../query-keys";
import type { AdminUsersResult } from "../types";
import { adminUserColumns } from "./admin-user-columns";

export function AdminUsersTable() {
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ history: "push" }),
  );
  const [limit, setLimit] = useQueryState(
    "limit",
    parseAsInteger.withDefault(10).withOptions({ history: "push" }),
  );
  const [query, setQuery] = useQueryState("q", parseAsString.withDefault(""));
  const currentPage = Math.max(1, page);
  const pageSize = Math.min(100, Math.max(1, limit));
  const debouncedSearch = useDebouncedValue(query, 400);

  const usersQuery = useQuery({
    queryKey: adminKeys.users.list(currentPage, pageSize, debouncedSearch),
    queryFn: () => listUsers(currentPage, pageSize, debouncedSearch),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (usersQuery.error) toast.error(usersQuery.error.message || "Failed to load users");
  }, [usersQuery.error]);

  const users = usersQuery.data?.users ?? [];
  const total = usersQuery.data?.total ?? 0;
  const pagination = { pageIndex: currentPage - 1, pageSize };
  const hasStaleRows = query !== debouncedSearch || usersQuery.isPlaceholderData;

  function changePage(updater: Updater<PaginationState>) {
    const next = typeof updater === "function" ? updater(pagination) : updater;
    void setPage(next.pageIndex + 1);
    void setLimit(next.pageSize);
  }

  return (
    <DataTable
      columns={adminUserColumns}
      data={users}
      searchKey="email"
      searchPlaceholder="Username or email..."
      searchValue={query}
      onSearchChange={(value) => {
        void setQuery(value || null);
        void setPage(1);
      }}
      isDataPending={usersQuery.isFetching || hasStaleRows}
      manualPagination
      pageCount={Math.ceil(total / pageSize)}
      pagination={pagination}
      onPaginationChange={changePage}
    />
  );
}

async function listUsers(page: number, limit: number, query: string): Promise<AdminUsersResult> {
  const { data, error } = await authClient.admin.listUsers({
    query: {
      limit,
      offset: (page - 1) * limit,
      ...(query ? { searchValue: query } : {}),
    },
  });

  if (error) throw new Error(error.message || "Failed to load users");
  return { users: data?.users ?? [], total: data?.total ?? 0 };
}
