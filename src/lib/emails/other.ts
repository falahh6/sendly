import { CategoryResult, ParsedEmail } from "../types/email";
import { emailKeywords } from "./data";

const categorizedEmails: Record<string, ParsedEmail[]> = {};

export const categorizeEmails = (
  parsedEmails: ParsedEmail[]
): CategoryResult[] => {
  console.log("CATEGORIZING EMAILS (length)", parsedEmails.length);
  for (const email of parsedEmails) {
    if (isImportant(email)) {
      assignToCategory("Important", email);
      continue;
    }

    if (isNewsletter(email)) {
      assignToCategory("Newsletter", email);
      continue;
    }

    if (isJobRelated(email)) {
      assignToCategory("Job", email);
      continue;
    }

    if (isSalesAndPromotional(email)) {
      assignToCategory("Sales and Promotions", email);
      continue;
    }

    if (isSocial(email)) {
      assignToCategory("Social", email);
      continue;
    }

    if (isPaymentsRelated(email)) {
      assignToCategory("Payments", email);
      continue;
    }

    assignToCategory("Others", email);
  }

  ensureAllEmailsCategorized(parsedEmails);

  return Object.entries(categorizedEmails)
    .filter(([, email]) => email.length > 0)
    .map(([section, emails]) => {
      return {
        section,
        emails,
      };
    });
};

const assignToCategory = (category: string, email: ParsedEmail) => {
  removeFromAllCategories(email);

  if (!categorizedEmails[category]) {
    categorizedEmails[category] = [];
  }

  if (!categorizedEmails[category].some((e) => e.threadId === email.threadId)) {
    categorizedEmails[category].push(email);
  }
};

const removeFromAllCategories = (email: ParsedEmail) => {
  for (const category in categorizedEmails) {
    categorizedEmails[category] = categorizedEmails[category].filter(
      (e) => e !== email
    );
  }
};

const isNewsletter = (email: ParsedEmail): boolean => {
  const newsletterIndicators = ["newsletter"];

  return newsletterIndicators.some((indicator) =>
    email.from.toLowerCase().includes(indicator.toLowerCase())
  );
};

const isJobRelated = (email: ParsedEmail): boolean => {
  const jobIndicators = ["job", "hiring", "career"];

  return jobIndicators.some((indicator) =>
    email.from.toLowerCase().includes(indicator.toLowerCase())
  );
};

const isSalesAndPromotional = (email: ParsedEmail): boolean => {
  const salesIndicators = ["sale", "discount", "offer", "deals"];
  const emailContent = `${email.subject}\n${email.snippet}\n${email.plainTextMessage}`;
  return [...salesIndicators, ...emailKeywords.promotionalEmails].some(
    (indicator) =>
      email.from.toLowerCase().includes(indicator.toLowerCase()) ||
      emailContent.toLowerCase().includes(indicator.toLowerCase())
  );
};

const isSocial = (email: ParsedEmail): boolean => {
  return emailKeywords.socials.some((indicator) =>
    email.from.toLowerCase().includes(indicator.toLowerCase())
  );
};

const isPaymentsRelated = (email: ParsedEmail): boolean => {
  return emailKeywords.paymentsAndInvoices.some((indicator) =>
    email.from.toLowerCase().includes(indicator.toLowerCase())
  );
};

const isImportant = (email: ParsedEmail): boolean => {
  const domains = ["@gmail", "@outlook", "@yahoo", "@hotmail"];

  return (
    domains.some((domain) => email.from.toLowerCase().includes(domain)) &&
    email.labelIds.includes("IMPORTANT")
  );
};

const ensureAllEmailsCategorized = (parsedEmails: ParsedEmail[]) => {
  const categorizedEmailSet = new Set(
    Object.values(parsedEmails)
      .flat()
      .map((email) => email.threadId + email.snippet)
  );
  console.log("CATEGORIZED EMAILS SET", categorizedEmailSet.size);

  for (const email of parsedEmails) {
    if (!categorizedEmailSet.has(email.threadId + email.snippet)) {
      console.log("UNCATEGORIZED EMAIL", email);
      assignToCategory("Others", email);
    }
  }
};
