const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const urls = {
  api: {
    base: API_BASE_URL,
    graphql: `${API_BASE_URL}/graphql`,
  },
} as const;
