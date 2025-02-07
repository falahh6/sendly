import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ParsedEmail } from "./types/email";

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

  const time = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (date.toDateString() === now.toDateString()) {
    return `Today - ${time}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday - ${time}`;
  }

  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${formattedDate} - ${time}`;
}

export const fetcher = async (url: string, authToken: string) => {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      auth: authToken,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch data");
  }

  return response.json();
};

export function removeNoreplyEmail(from: string): string {
  return from.replace(/<[^>]+>|"/g, "");
}

export const groupEmailsByThread = (emails: ParsedEmail[]) => {
  const threadMap = new Map<string, ParsedEmail[]>();

  emails.forEach((email) => {
    if (!email.threadId) {
      threadMap.set(email.id, [email]);
    } else {
      if (!threadMap.has(email.threadId)) {
        threadMap.set(email.threadId, []);
      }
      threadMap.get(email.threadId)?.push(email);
    }
  });

  return Array.from(threadMap.entries()).map(([threadId, emails]) => ({
    threadId,
    emails: emails.sort(
      (a, b) =>
        new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime()
    ),
  }));
};
