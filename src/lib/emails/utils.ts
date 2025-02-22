import Sentiment from "sentiment";
import lda from "lda";
import {
  highPriorityKeywords,
  highPriorityWords,
  lowPriorityWords,
} from "./data";
import { Email, ParsedEmail } from "../types/email";
import { gmail_v1 } from "googleapis";

export async function parseEmail(
  email: Email,
  gmailInstance: gmail_v1.Gmail
): Promise<ParsedEmail> {
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

  const from = getHeaderValue("From") ?? "";
  const to = parseRecipients(getHeaderValue("To"));
  const cc = parseRecipients(getHeaderValue("Cc"));
  const bcc = parseRecipients(getHeaderValue("Bcc"));
  const date = getHeaderValue("Date");
  const subject = getHeaderValue("Subject") ?? "";
  const messageId = getHeaderValue("Message-ID");
  const replyTo = getHeaderValue("Reply-To");

  const snippet = email.snippet || "";
  const threadId = email.threadId || "";

  const labelIds = email.labelIds || [];

  let plainTextMessage: string | null = null;
  let htmlMessage: string | null = null;
  const attachments: {
    filename: string;
    data: string | null;
    mimeType?: string | null;
    attachmentId?: string | null;
  }[] = [];

  if (email.payload.parts) {
    for (const part of email.payload.parts as gmail_v1.Schema$MessagePart[]) {
      const mimeType = part.mimeType;
      const filename = part.filename ?? "";

      if (mimeType === "text/plain" && part.body?.data) {
        plainTextMessage = Buffer.from(part.body.data, "base64").toString(
          "utf-8"
        );
      } else if (mimeType === "text/html" && part.body?.data) {
        htmlMessage = Buffer.from(part.body.data, "base64").toString("utf-8");
      } else if (filename) {
        // gmailInstance.users.messages.attachments
        //   .get({
        //     messageId: email.id,
        //     id: part.body?.attachmentId as string,
        //     userId: "me",
        //   })
        //   .then((response) => {
        //     console.log("Attachment Data: ", response.data);

        //     attachments.push({
        //       filename,
        //       mimeType: mimeType ?? "",
        //       data: response.data.data ?? "",
        //       attachmentId: part.body?.attachmentId,
        //     });
        //   });

        const attachmentData =
          await gmailInstance.users.messages.attachments.get({
            messageId: email.id,
            id: part.body?.attachmentId as string,
            userId: "me",
          });

        attachments.push({
          filename,
          mimeType: mimeType ?? "",
          data: attachmentData.data.data ?? "",
          attachmentId: part.body?.attachmentId,
        });
      }
    }
  }

  const priorityGrade = gradeEmail({
    subject,
    snippet,
    labelIds,
    from,
    date,
  });

  return {
    id: email.id,
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
