import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

//parse emails
export function parseEmail(email: Email): ParsedEmail {
  const headers = email.payload.headers;

  const getHeaderValue = (headerName: string): string | null => {
    return (
      headers.find(
        (header) => header.name.toLowerCase() === headerName.toLowerCase()
      )?.value || null
    );
  };

  const parseRecipients = (headerValue: string | null): string[] => {
    return headerValue
      ? headerValue.split(",").map((address) => address.trim())
      : [];
  };

  // Extract main fields
  const from = getHeaderValue("From") || "";
  const to = parseRecipients(getHeaderValue("To"));
  const cc = parseRecipients(getHeaderValue("Cc"));
  const bcc = parseRecipients(getHeaderValue("Bcc"));
  const date = getHeaderValue("Date");
  const subject = getHeaderValue("Subject") || "";
  const messageId = getHeaderValue("Message-ID");
  const replyTo = getHeaderValue("Reply-To");

  // Extract snippet and thread ID
  const snippet = email.snippet || "";
  const threadId = email.threadId || "";

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
      const filename = part.filename || "";

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
          data: part.body?.data || null,
        });
      }
    }
  }

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
  };
}
