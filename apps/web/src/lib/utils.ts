import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// eg: NOT_YET_RELEASED -> not yet released
export function formatEnum(value: string): string {
  return value.toLowerCase().replace(/_/g, " ");
}
