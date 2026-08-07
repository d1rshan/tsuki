import { authClient } from "@tsuki/auth/client";

export type AdminUser = typeof authClient.$Infer.Session.user;
export type AdminUsersResult = {
  total: number;
  users: AdminUser[];
};
