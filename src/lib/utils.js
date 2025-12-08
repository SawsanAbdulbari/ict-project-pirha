// This file contains utility functions, and specifically, the `cn` function for combining CSS classes.
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
// This function intelligently merges CSS class strings, making it easy to conditionally apply and combine Tailwind CSS classes without conflicts.
// It takes any number of class name strings or objects (as supported by `clsx`).
// It returns a single, clean class string.
// It uses `clsx` for handling conditional classes and `tailwind-merge` to de-duplicate and merge Tailwind utility classes.
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
