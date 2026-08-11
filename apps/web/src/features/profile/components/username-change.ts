type UsernameChangeError = {
  code?: string;
  message?: string;
  status?: number;
};

export function profilePathForUsername(username: string) {
  return `/profile/${username.toLowerCase()}`;
}

export function usernameChangeErrorMessage(error: UsernameChangeError) {
  if (error.status === 429) {
    return "You can change your username once every 7 days. Please try again after your cooldown ends.";
  }

  if (error.code === "USERNAME_IS_ALREADY_TAKEN") return "That username is already taken.";

  return error.message || "Unable to change your username.";
}
