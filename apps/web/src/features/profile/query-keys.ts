export const profileKeys = {
  relationship: (viewerId: string | null, username: string) =>
    ["profile", username, "relationship", viewerId] as const,
};
