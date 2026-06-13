const WEB_BASE_URL = process.env.WEB_URL || "http://localhost:3000";

export const urls = {
  web: WEB_BASE_URL,
} as const;
