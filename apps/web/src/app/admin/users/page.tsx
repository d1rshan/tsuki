import { headers } from "next/headers";

import { authClient } from "@/lib/auth-client";
import { AdminUsersTable } from "@/components/admin/admin-users-table";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function AdminUsersPage(props: PageProps) {
  const searchParams = await props.searchParams;

  const pageParam = typeof searchParams.page === "string" ? parseInt(searchParams.page, 10) : 1;
  const limitParam = typeof searchParams.limit === "string" ? parseInt(searchParams.limit, 10) : 10;
  const q = typeof searchParams.q === "string" ? searchParams.q : undefined;

  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const limit = isNaN(limitParam) || limitParam < 1 ? 10 : limitParam;
  const offset = (page - 1) * limit;

  const { data } = await authClient.admin.listUsers({
    query: {
      limit,
      offset,
      ...(q ? { searchValue: q } : {}),
    },
    fetchOptions: {
      headers: await headers(),
    },
  });

  const users = data?.users ?? [];
  const hasMore = users.length === limit;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black uppercase tracking-tighter">USERS</h1>
      </div>

      <AdminUsersTable users={users} hasMore={hasMore} />
    </div>
  );
}
