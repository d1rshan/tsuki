const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const urls = {
  api: API_URL,
  app: APP_URL,
} as const;
