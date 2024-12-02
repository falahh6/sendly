import compromise from "compromise";
import { ParsedEmail } from "../types/email";

export class EmailNLPEnrichment {
  // Advanced NLP Analysis
  extractEntities(email: ParsedEmail): string[] {
    const doc = compromise(email.plainTextMessage ?? email.snippet);

    const entities = [
      ...doc.people().out("array"),
      ...doc.organizations().out("array"),
      ...doc.places().out("array"),
    ];

    return entities;
  }

  // Sentiment Analysis
  analyzeSentiment(email: ParsedEmail): number {
    // Simplified sentiment scoring
    const positiveWords = ["great", "excellent", "awesome", "congratulations"];
    const negativeWords = ["problem", "issue", "complaint", "urgent"];

    const text = email.plainTextMessage ?? email.snippet;
    const tokens = text.toLowerCase().split(/\s+/);

    const positiveScore = tokens.filter((token) =>
      positiveWords.includes(token)
    ).length;

    const negativeScore = tokens.filter((token) =>
      negativeWords.includes(token)
    ).length;

    // Normalize between -1 and 1
    return (
      (positiveScore - negativeScore) / (positiveScore + negativeScore + 1)
    );
  }
}
