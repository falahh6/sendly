import Sentiment from "sentiment";
import lda from "lda";
import {
  highPriorityKeywords,
  highPriorityWords,
  lowPriorityWords,
} from "./data";
import { ParsedEmail } from "../types/email";
import { gmail_v1, google } from "googleapis";
import { UTApi } from "uploadthing/server";

import { AddressObject, ParsedMail, simpleParser } from "mailparser";
import { evervault } from "../evervault";
import { Integration } from "@prisma/client";

const utapi = new UTApi();

async function uploadToUploadThing(
  filename: string,
  base64Data: string,
  mimeType: string
) {
  const buffer = Buffer.from(base64Data, "base64");
  const response = await utapi.uploadFiles([
    new File([buffer], filename, { type: mimeType }),
  ]);

  return response[0].data?.ufsUrl || "";
}

const extractEmails = (
  addresses: AddressObject | AddressObject[] | null | undefined
): string[] => {
  if (!addresses) return [];
  if (Array.isArray(addresses)) {
    return addresses.map((addr) => addr.text || "").filter(Boolean);
  }
  return [addresses.text || ""].filter(Boolean);
};

export async function parseEmail(
  email: gmail_v1.Schema$Message
): Promise<ParsedEmail> {
  if (!email.raw) {
    throw new Error("Email raw data is missing.");
  }

  const decodedEmail = Buffer.from(email.raw, "base64").toString("utf-8");

  const parsedEmail: ParsedMail = await simpleParser(decodedEmail);

  return {
    id: email.id || "",
    from: parsedEmail.from?.text || "",
    to: extractEmails(parsedEmail.to),
    cc: extractEmails(parsedEmail.cc),
    bcc: extractEmails(parsedEmail.bcc),
    date: parsedEmail.date?.toISOString() || null,
    subject: parsedEmail.subject || "",
    messageId: parsedEmail.messageId || null,
    replyTo: parsedEmail.replyTo?.text || null,
    snippet: email.snippet || "",
    threadId: email.threadId || "",
    plainTextMessage: parsedEmail.text || null,
    htmlMessage: parsedEmail.html || null,
    attachments: await Promise.all(
      parsedEmail.attachments.map(async (attachment) => {
        const fileUrl = await uploadToUploadThing(
          attachment.filename || "unknown",
          attachment.content.toString("base64"),
          attachment.contentType || ""
        );

        return {
          filename: attachment.filename || "unknown",
          data: fileUrl,
          mimeType: attachment.contentType || null,
          attachmentId: attachment.cid || null,
        };
      })
    ),
    labelIds: email.labelIds || [],
    priorityGrade: "normal",
    categorization: undefined,
    nlpEntities: [],
    sentimentScore: 0,
    privacyCompliant: true,
    category: "general",
  };
}

export function gradeEmail({
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

  const config = {
    importantSenders: ["boss@example.com", "client@example.com"],
    highPriorityKeywords: highPriorityKeywords,
    penalties: {
      promotions: 20,
    },
    bonuses: {
      recentEmail: 20,
      highPriorityKeyword: 30,
      importantSender: 50,
      importantLabel: 100,
      topicMatch: 40,
    },
    gradingThresholds: {
      A: 80,
      B: 50,
    },
    recencyHours: 24,
    topics: {
      highPriority: highPriorityWords,
      lowPriority: lowPriorityWords,
    },
  };

  const normalizeString = (str: string): string => str.toLowerCase();
  const containsKeyword = (text: string, keywords: string[]): boolean =>
    keywords.some((keyword) => normalizeString(text).includes(keyword));

  if (config.importantSenders.some((sender) => from.includes(sender))) {
    score += config.bonuses.importantSender;
  }

  if (labelIds.includes("IMPORTANT")) {
    score += config.bonuses.importantLabel;
  }

  const isPromotional = labelIds.includes("CATEGORY_PROMOTIONS");
  if (isPromotional) {
    score -= config.penalties.promotions;
  }

  const emailContent = normalizeString(subject + snippet);
  if (containsKeyword(emailContent, config.highPriorityKeywords)) {
    score += config.bonuses.highPriorityKeyword;
  }

  if (labelIds.includes("CATEGORY_PROMOTIONS")) {
    score -= config.penalties.promotions;
  }

  if (date) {
    const emailDate = new Date(date).getTime();
    const now = Date.now();
    const ageInHours = (now - emailDate) / (1000 * 60 * 60);
    if (ageInHours < config.recencyHours) {
      score += config.bonuses.recentEmail;
    }
  }

  const sentiment = new Sentiment();
  const result = sentiment.analyze(subject + snippet);
  const comparative = result.comparative;

  const ldaResult = lda([subject + snippet], 3, 1);
  const detectedTopics = ldaResult.map((topic) => {
    return topic[0];
  });

  if (
    detectedTopics.some((topic) => config.topics.highPriority.includes(topic))
  ) {
    score += config.bonuses.topicMatch;
  }

  if (
    detectedTopics.some((topic) => config.topics.lowPriority.includes(topic))
  ) {
    score -= config.penalties.promotions;
  }

  if (comparative > 1.0) {
    score += 50;
  } else if (comparative > 0.2) {
    score += 20;
  } else if (comparative < -1.0) {
    score -= 50;
  } else if (comparative < -0.2) {
    score -= 20;
  }

  let grade: string;
  if (score >= config.gradingThresholds.A) {
    grade = "A";
  } else if (score >= config.gradingThresholds.B) {
    grade = "B";
  } else {
    grade = "C";
  }

  if (isPromotional && grade === "A") {
    grade = "B";
  }

  return grade;
}

export const getOAuthClient = async (integration: Integration) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CID,
    process.env.GOOGLE_CS
  );

  oauth2Client.setCredentials({
    access_token: await evervault.decrypt(integration.accessToken),
    refresh_token: await evervault.decrypt(integration.refreshToken),
  });

  return oauth2Client;
};
