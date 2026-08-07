export function isAdminRole(role?: string | null) {
  return role === "admin" || role === "owner";
}
