import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const baseUrl = process.env.VERCEL_URL ?? "http://localhost:3000";

//parse emails
export function parseEmail(email: Email): ParsedEmail {
  const headers = email.payload.headers;

  const getHeaderValue = (headerName: string): string | null => {
    return (
      headers.find(
        (header) => header.name.toLowerCase() === headerName.toLowerCase()
      )?.value ?? null
    );
  };

  const parseRecipients = (headerValue: string | null): string[] => {
    return headerValue
      ? headerValue.split(",").map((address) => address.trim())
      : [];
  };

  // Extract main fields
  const from = getHeaderValue("From") ?? "";
  const to = parseRecipients(getHeaderValue("To"));
  const cc = parseRecipients(getHeaderValue("Cc"));
  const bcc = parseRecipients(getHeaderValue("Bcc"));
  const date = getHeaderValue("Date");
  const subject = getHeaderValue("Subject") ?? "";
  const messageId = getHeaderValue("Message-ID");
  const replyTo = getHeaderValue("Reply-To");

  // Extract snippet and thread ID
  const snippet = email.snippet || "";
  const threadId = email.threadId || "";

  //labelids
  const labelIds = email.labelIds || [];

  // Initialize message and attachment variables
  let plainTextMessage: string | null = null;
  let htmlMessage: string | null = null;
  const attachments: {
    filename: string;
    mimeType: string;
    data: string | null;
  }[] = [];

  // Check if there are parts (attachments and message bodies)
  if (email.payload.parts) {
    for (const part of email.payload.parts) {
      const mimeType = part.mimeType;
      const filename = part.filename ?? "";

      if (mimeType === "text/plain" && part.body?.data) {
        plainTextMessage = Buffer.from(part.body.data, "base64").toString(
          "utf-8"
        );
      } else if (mimeType === "text/html" && part.body?.data) {
        htmlMessage = Buffer.from(part.body.data, "base64").toString("utf-8");
      } else if (filename) {
        // Handle attachments
        attachments.push({
          filename,
          mimeType,
          data: part.body?.data ?? null,
        });
      }
    }
  }

  // Scoring logic
  const priorityGrade = gradeEmail({
    subject,
    snippet,
    labelIds,
    from,
    date,
  });

  return {
    from,
    to,
    cc,
    bcc,
    date,
    subject,
    messageId,
    replyTo,
    snippet,
    threadId,
    plainTextMessage,
    htmlMessage,
    attachments,
    labelIds,
    priorityGrade,
  };
}

function gradeEmail({
  subject,
  snippet,
  labelIds,
  from,
  date,
}: {
  subject: string;
  snippet: string;
  labelIds: string[];
  from: string;
  date: string | null;
}): string {
  let score = 0;

  // Sender scoring: Add points for known important senders
  const importantSenders = ["boss@example.com", "client@example.com"];
  if (importantSenders.some((sender) => from.includes(sender))) {
    score += 50;
  }

  if (labelIds.includes("IMPORTANT")) {
    score += 100;
  }

  // Keyword scoring: Add points for high-priority keywords
  const highPriorityKeywords = ["urgent", "action required", "asap"];
  if (
    highPriorityKeywords.some((keyword) =>
      (subject + snippet).toLowerCase().includes(keyword)
    )
  ) {
    score += 30;
  }

  // Label scoring: Penalize promotional emails
  if (labelIds.includes("CATEGORY_PROMOTIONS")) {
    score -= 20;
  }

  // Time sensitivity: Add points if the email is recent
  if (date) {
    const emailDate = new Date(date).getTime();
    const now = Date.now();
    const ageInHours = (now - emailDate) / (1000 * 60 * 60);
    if (ageInHours < 24) {
      score += 20;
    }
  }

  // Grade assignment
  if (score > 80) return "A";
  if (score >= 50) return "B";
  return "C";
}
