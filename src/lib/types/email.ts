/* eslint-disable @typescript-eslint/no-unused-vars */

export type Email = {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload: {
    headers: { name: string; value: string }[];
    parts?: {
      partId: string;
      mimeType: string;
      headers: { name: string; value: string }[];
      body?: { size: number; data?: string };
      filename?: string;
    }[];
  };
};

export type ParsedEmail = {
  id: string;
  from: string;
  to: string[];
  cc: string[];
  bcc: string[];
  date: string | null;
  subject: string;
  messageId: string | null;
  replyTo: string | null;
  snippet: string;
  threadId: string;
  plainTextMessage: string | null;
  htmlMessage: string | null;
  attachments: {
    filename: string;
    data: string | null;
    mimeType?: string | null;
    attachmentId?: string | null;
  }[];
  labelIds: string[];
  priorityGrade: string;
  categorization?: EmailCategorization;
  nlpEntities?: string[];
  sentimentScore?: number;
  privacyCompliant?: boolean;
  category?: string;
};

export type EmailCategory =
  | "Work"
  | "Personal"
  | "Promotional"
  | "Transactional"
  | "Notification"
  | "Unknown";

export type EmailSubCategory =
  | "Project-Specific"
  | "Department-Specific"
  | "High-Priority"
  | "Low-Priority"
  | "General";

export interface EmailCategorization {
  primaryCategory: EmailCategory;
  subCategory: EmailSubCategory;
  confidence: number;
}

export interface CategoryResult {
  section: string;
  emails: ParsedEmail[];
}
