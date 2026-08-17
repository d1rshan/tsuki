import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin" };

import { AdminLayout } from "@/features/admin/layouts/admin-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
