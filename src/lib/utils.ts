import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const baseUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : process.env.NEXT_PUBLIC_SITE_URL;

export function formatStringDate(inputDate: string): string {
  if (!inputDate || inputDate === "") return "";
  const date = new Date(inputDate);
  const now = new Date();

  // Get time portion
  const time = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Check if the date is today
  if (date.toDateString() === now.toDateString()) {
    return `Today - ${time}`;
  }

  // Check if the date was yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday - ${time}`;
  }

  // For older dates
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${formattedDate} - ${time}`;
}
