import { ParsedEmail } from "../types/email";

export class PrivacyComplianceService {
  // GDPR and Privacy Compliance Checks
  checkPrivacyCompliance(email: ParsedEmail): boolean {
    const sensitiveKeywords = [
      "personal data",
      "confidential",
      "ssn",
      "credit card",
      "medical",
      "health",
    ];

    const complianceChecks = [
      this.checkSensitiveContent(email, sensitiveKeywords),
      this.validateDataRetention(email),
      this.checkConsentIndications(email),
    ];

    return complianceChecks.every((check) => check);
  }

  private checkSensitiveContent(
    email: ParsedEmail,
    sensitiveKeywords: string[]
  ): boolean {
    const content = (email.plainTextMessage ?? email.snippet).toLowerCase();
    return !sensitiveKeywords.some((keyword) => content.includes(keyword));
  }

  private validateDataRetention(email: ParsedEmail): boolean {
    const currentDate = new Date();
    const emailDate = new Date(email.date ?? "");

    // Check if email is older than 2 years
    const retentionPeriod = 2 * 365 * 24 * 60 * 60 * 1000; // 2 years in milliseconds
    return currentDate.getTime() - emailDate.getTime() < retentionPeriod;
  }

  private checkConsentIndications(email: ParsedEmail): boolean {
    const consentIndicators = ["consent", "approve", "permission", "agree"];

    return consentIndicators.some((indicator) =>
      (email.subject + " " + (email.plainTextMessage ?? ""))
        .toLowerCase()
        .includes(indicator)
    );
  }
}
