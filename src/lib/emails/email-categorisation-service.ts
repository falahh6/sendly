import * as natural from "natural";

import {
  CategoryResult,
  EmailCategorization,
  EmailCategory,
  EmailSubCategory,
  ParsedEmail,
} from "../types/email";
import { EmailNLPEnrichment } from "./nlp-enrichment";
import { PrivacyComplianceService } from "./privacy-and-compliance";
import { emailKeywords } from "./data";

export class EmailCategorizationService {
  private readonly tokenizer: natural.WordTokenizer;
  private readonly nlpEnrichment: EmailNLPEnrichment;
  private readonly complianceService: PrivacyComplianceService;
  private classifier: any;

  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.nlpEnrichment = new EmailNLPEnrichment();
    this.complianceService = new PrivacyComplianceService();
    this.initializeClassifier();
  }

  private async initializeClassifier() {
    // Initialize machine learning classifier
    // Placeholder for a more advanced setup
    this.classifier = new natural.BayesClassifier();
  }

  // 1. Sender-based Categorization
  async categorizeBySender(email: ParsedEmail): Promise<EmailCategorization> {
    const domain = this.extractDomain(email.from);
    const corporateDomains = ["google.com", "microsoft.com", "apple.com"];

    const isProfessional = corporateDomains.some((d) => domain.includes(d));

    return {
      primaryCategory: isProfessional ? "Work" : "Personal",
      subCategory: isProfessional ? "Department-Specific" : "General",
      confidence: 0.85,
    };
  }

  // 2. Content-based Categorization
  async categorizeByContent(email: ParsedEmail): Promise<EmailCategorization> {
    const tokens = this.tokenizer.tokenize(
      email.plainTextMessage ?? email.snippet
    );

    // Basic NLP-based categorization
    const workKeywords = emailKeywords.workUpdates;
    const promotionalKeywords = emailKeywords.promotionalEmails;
    const personalKeywords = emailKeywords.personalCorrespondence;

    const workScore = tokens.filter((t) => workKeywords.includes(t)).length;
    const promoScore = tokens.filter((t) =>
      promotionalKeywords.includes(t)
    ).length;
    const personalScore = tokens.filter((t) =>
      personalKeywords.includes(t)
    ).length;

    let primaryCategory: EmailCategory = "Unknown";
    let subCategory: EmailSubCategory = "General";

    if (workScore > promoScore && workScore > personalScore) {
      primaryCategory = "Work";
      subCategory = "Project-Specific";
    } else if (promoScore > workScore && promoScore > personalScore) {
      primaryCategory = "Promotional";
    } else if (personalScore > workScore && personalScore > promoScore) {
      primaryCategory = "Personal";
    }

    return {
      primaryCategory,
      subCategory,
      confidence: 0.75,
    };
  }

  // 3. NLP Enrichment Integration
  enrichEmailWithNLP(email: ParsedEmail): {
    entities: string[];
    sentiment: number;
  } {
    const entities = this.nlpEnrichment.extractEntities(email);
    const sentiment = this.nlpEnrichment.analyzeSentiment(email);
    return { entities, sentiment };
  }

  // 4. Privacy and Compliance Integration
  checkEmailCompliance(email: ParsedEmail): boolean {
    return this.complianceService.checkPrivacyCompliance(email);
  }

  // 5. Comprehensive Categorization with Enrichment and Compliance
  async comprehensiveCategorize(
    emails: ParsedEmail[]
  ): Promise<CategoryResult[]> {
    const categorizedEmails: { [key: string]: ParsedEmail[] } = {};

    for (const email of emails) {
      // Categorize by sender and content
      const senderCategory = await this.categorizeBySender(email);
      const contentCategory = await this.categorizeByContent(email);

      // Enrich with NLP
      const nlpData = this.enrichEmailWithNLP(email);

      // Check privacy compliance
      const isCompliant = this.checkEmailCompliance(email);

      // Merge categorizations
      const finalCategory = this.mergeCategorizations(
        senderCategory,
        contentCategory
      );

      const categoryKey = `${finalCategory.primaryCategory} - ${finalCategory.subCategory}`;

      if (!categorizedEmails[categoryKey]) {
        categorizedEmails[categoryKey] = [];
      }

      // Enrich email metadata with NLP and compliance details
      categorizedEmails[categoryKey].push({
        ...email,
        categorization: finalCategory,
        nlpEntities: nlpData.entities,
        sentimentScore: nlpData.sentiment,
        privacyCompliant: isCompliant,
      });
    }

    return Object.entries(categorizedEmails).map(([section, emails]) => ({
      section,
      emails,
    }));
  }

  // Utility Methods
  private extractDomain(email: string): string {
    return email.split("@")[1] || "";
  }

  private mergeCategorizations(
    sender: EmailCategorization,
    content: EmailCategorization
  ): EmailCategorization {
    return {
      primaryCategory:
        sender.primaryCategory === content.primaryCategory
          ? sender.primaryCategory
          : "Unknown",
      subCategory:
        sender.subCategory === content.subCategory
          ? sender.subCategory
          : "General",
      confidence: (sender.confidence + content.confidence) / 2,
    };
  }
}

// Usage Example
export async function categorizeEmails(
  emails: ParsedEmail[]
): Promise<CategoryResult[]> {
  const service = new EmailCategorizationService();

  return await service.comprehensiveCategorize(emails);
}
