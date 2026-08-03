"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Updater, type PaginationState } from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { toast } from "sonner";

import { authClient } from "@tsuki/auth/client";
import { DataTable } from "@/components/ui/data-table";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

import { columns } from "./columns";

export type UserData = typeof authClient.$Infer.Session.user;

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

  // Local state for the input field to keep the UI snappy
  const [inputValue, setInputValue] = useState(q);
  const debouncedInputValue = useDebounce(inputValue, 500);

  // Sync debounced local state to URL and reset page if search changes
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
    queryKey: ["admin-users", page, limit, q],
    queryFn: async () => {
      const offset = (page - 1) * limit;
      const res = await authClient.admin.listUsers({
        query: {
          limit,
          offset,
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
    },
    // Keep previous data while fetching new pages so table doesn't flicker empty
    placeholderData: (prev) => prev,
  });

  useEffect(() => {
    if (isError && error) {
      toast.error(error.message || "An error occurred while fetching users.");
    }
  }, [isError, error]);

  const pageCount = Math.ceil(total / limit);

  const pagination = {
    pageIndex: page - 1,
    pageSize: limit,
  };

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
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
      />
    </div>
  );
}
