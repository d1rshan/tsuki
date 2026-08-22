"use client";

import { useMutation } from "@tanstack/react-query";

import { updateProfile } from "../actions";
import type { ProfileUpdate } from "../schemas";

export function useProfileUpdateMutation() {
  return useMutation({ mutationFn: (profile: ProfileUpdate) => updateProfile(profile) });
}
