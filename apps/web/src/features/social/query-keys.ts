export const socialKeys = {
  all: ["social"] as const,
  discovery: (username: string) => [...socialKeys.all, "discovery", username] as const,
  feed: (type: "following" | "public") => [...socialKeys.all, "feed", type] as const,
};
