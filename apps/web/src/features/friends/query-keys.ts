export const friendsKeys = {
  all: ["friends"] as const,
  discovery: (username: string) => [...friendsKeys.all, "discovery", username] as const,
  feed: (type: "following" | "public") => [...friendsKeys.all, "feed", type] as const,
};
