const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const urls = {
  api: API_BASE_URL,
} as const;
