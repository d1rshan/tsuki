"use client";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { useDebounce } from "@/hooks/use-debounce";

export type UserData = typeof authClient.$Infer.Session.user;

export function AdminUsersTable() {
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
    parseAsString
      .withDefault("")
      .withOptions({ shallow: false, history: "push", throttleMs: 1000 }),
  );

  // Debounce the search query for React Query fetching so we don't spam the API on every keystroke
  const debouncedQ = useDebounce(q, 500);

  const { data: users = [], isFetching } = useQuery({
    queryKey: ["admin-users", page, limit, debouncedQ],
    queryFn: async () => {
      const offset = (page - 1) * limit;
      const res = await authClient.admin.listUsers({
        query: {
          limit,
          offset,
          ...(debouncedQ ? { searchValue: debouncedQ } : {}),
        },
      });

      if (res.error) {
        throw new Error(res.error.message);
      }

      return res.data?.users ?? [];
    },
    // Keep previous data while fetching new pages so table doesn't flicker empty
    placeholderData: (prev) => prev,
  });

  const hasMore = users.length === limit;

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
    <div className={`transition-opacity duration-200 ${isFetching ? "opacity-50" : "opacity-100"}`}>
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
    </div>
  );
}
