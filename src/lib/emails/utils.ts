import Sentiment from "sentiment";
import lda from "lda";
import {
  emailKeywords,
  highPriorityKeywords,
  highPriorityWords,
  lowPriorityWords,
} from "./data";
import { Email, ParsedEmail } from "../types/email";

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
    mimeType: string;
    data: string | null;
  }[] = [];

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
        attachments.push({
          filename,
          mimeType,
          data: part.body?.data ?? null,
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

const labelToCategoryMap: { [key: string]: string } = {
  CATEGORY_PERSONAL: "Personal Correspondence",
  CATEGORY_SOCIAL: "Social Updates",
  CATEGORY_PROMOTIONS: "Promotional Emails",
  CATEGORY_UPDATES: "Work Updates",
  CATEGORY_FORUMS: "Forums",
  IMPORTANT: "Important",
  SPAM: "Spam/Junk",
};

export function categorizeEmails(parsedEmails: ParsedEmail[]): {
  section: string;
  emails: ParsedEmail[];
}[] {
  const topics = [
    {
      name: "Important",
      keywords: emailKeywords.important,
    },
    {
      name: "Payments and Invoices",
      keywords: emailKeywords.paymentsAndInvoices,
    },
    {
      name: "Work Updates",
      keywords: emailKeywords.workUpdates,
    },
    {
      name: "Promotional Emails",
      keywords: emailKeywords.promotionalEmails,
    },

    {
      name: "Social Updates",
      keywords: emailKeywords.socials,
    },
    {
      name: "Personal Correspondence",
      keywords: emailKeywords.personalCorrespondence,
    },
    {
      name: "Reminders and Notifications",
      keywords: emailKeywords.remindersAndNotifications,
    },
    {
      name: "Spam/Junk",
      keywords: emailKeywords.spamOrJunk,
    },
    {
      name: "Travel and Reservations",
      keywords: emailKeywords.travelAndReservations,
    },
    { name: "Miscellaneous/Others", keywords: [] }, // Catch-all
  ];

  const categorizedEmails: Record<string, ParsedEmail[]> = {};

  const normalizeString = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9\s]/g, "");

  for (const email of parsedEmails) {
    const content = normalizeString(email.subject + " " + email.snippet);
    let categorized = false;

    if (email.labelIds.includes("IMPORTANT")) {
      console.log("IMPORTANT EMAIL : ", email.subject);

      if (!categorizedEmails["Important"]) {
        categorizedEmails["Important"] = [];
      }
      categorizedEmails["Important"].push(email);

      categorized = true;
    }

    for (const labelId of email.labelIds) {
      if (labelId === "IMPORTANT") {
        continue;
      }

      if (labelToCategoryMap[labelId]) {
        const categoryName = labelToCategoryMap[labelId];
        console.log("CATEGORY NAME : ", categoryName);

        if (!categorizedEmails[categoryName]) {
          categorizedEmails[categoryName] = [];
        }
        categorizedEmails[categoryName].push(email);
        categorized = true;
        break;
      }
    }

    if (!categorized) {
      for (const topic of topics) {
        if (
          topic.keywords.some((keyword) =>
            content.includes(normalizeString(keyword))
          )
        ) {
          if (!categorizedEmails[topic.name]) {
            categorizedEmails[topic.name] = [];
          }
          categorizedEmails[topic.name].push(email);
          categorized = true;
          break; // Email is categorized based on keywords
        }
      }
    }

    if (!categorized) {
      if (!categorizedEmails["Miscellaneous/Others"]) {
        categorizedEmails["Miscellaneous/Others"] = [];
      }
      categorizedEmails["Miscellaneous/Others"].push(email);
    }
  }

  return Object.entries(categorizedEmails)
    .filter(([_, emails]) => emails.length > 0)
    .map(([section, emails]) => ({
      section,
      emails,
    }));
}
