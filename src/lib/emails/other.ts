import { CategoryResult, ParsedEmail } from "../types/email";

export const categorizeEmails = (emails: ParsedEmail[]): CategoryResult[] => {
  const categories: Record<string, ParsedEmail[]> = {};
  const assignedEmailIds = new Set<string>(); // Track assigned emails

  const assignToCategory = (category: string, email: ParsedEmail) => {
    if (assignedEmailIds.has(email.threadId)) return; // Skip if already categorized
    if (!categories[category]) categories[category] = [];
    categories[category].push({ ...email, category });
    assignedEmailIds.add(email.threadId); // Mark email as categorized
  };

  emails.forEach((email) => {
    // **Structural Categorization**
    const domain = email.from.split("@")[1];
    const structuralCategory =
      domain.includes("corporate") || domain.endsWith(".com")
        ? "Corporate"
        : "Personal";
    assignToCategory(structuralCategory, email);

    const senderAuthCategory = getSenderAuthCategory(email);
    assignToCategory(senderAuthCategory, email);

    // **Relationship-Based Categorization**
    const interactionCategory = getInteractionCategory(email);
    assignToCategory(interactionCategory, email);

    // **Content-Based Categorization**
    const contentCategory = getContentCategory(email);
    assignToCategory(contentCategory, email);

    const metadataCategory = getMetadataCategory(email);
    assignToCategory(metadataCategory, email);

    // **Advanced ML Categorization**
    const mlCategory = getMLBasedCategory(email);
    assignToCategory(mlCategory, email);
  });

  // Convert categorized emails into the CategoryResult format
  return Object.keys(categories).map((key) => ({
    section: key,
    emails: categories[key],
  }));
};

// **Sender-Based Categorization**
const getSenderAuthCategory = (email: ParsedEmail): string => {
  const spfPassed = email.labelIds.includes("SPF_PASSED");
  const dkimPassed = email.labelIds.includes("DKIM_PASSED");
  const dmarcPassed = email.labelIds.includes("DMARC_PASSED");

  return spfPassed && dkimPassed && dmarcPassed
    ? "Verified Sender"
    : "Unverified Sender";
};

// **Relationship-Based Categorization**
const getInteractionCategory = (email: ParsedEmail): string => {
  return email.labelIds.includes("INBOX")
    ? "Primary Contact"
    : "Secondary Contact";
};

// **Content-Based Categorization**
const getContentCategory = (email: ParsedEmail): string => {
  const promotionalKeywords = ["sale", "discount", "offer"];
  const transactionalKeywords = ["invoice", "receipt", "payment"];
  const tokens = email.subject.toLowerCase().split(" ");

  if (tokens.some((token) => promotionalKeywords.includes(token)))
    return "Promotional";
  if (tokens.some((token) => transactionalKeywords.includes(token)))
    return "Transactional";
  return "Informational";
};

// **Metadata-Based Categorization**
const getMetadataCategory = (email: ParsedEmail): string => {
  const hour = new Date().getHours();
  const isWeekend = [0, 6].includes(new Date().getDay());

  if (hour >= 9 && hour <= 17 && !isWeekend) return "Work Hours Communication";
  if (isWeekend) return "Weekend Communication";
  return "Off Hours Communication";
};

// **ML-Based Categorization**
const getMLBasedCategory = (email: ParsedEmail): string => {
  const importanceScore = Math.random(); // Simulated ML-based scoring
  return importanceScore > 0.7 ? "High Priority" : "Low Priority";
};
