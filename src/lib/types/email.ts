/* eslint-disable @typescript-eslint/no-unused-vars */

type Email = {
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

type ParsedEmail = {
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
  attachments: { filename: string; mimeType: string; data: string | null }[];
};
