export const adminKeys = {
  users: {
    all: ["admin", "users"] as const,
    list: (page: number, limit: number, query: string) =>
      ["admin", "users", page, limit, query] as const,
  },
};
