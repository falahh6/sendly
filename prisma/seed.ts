const { PrismaClient } = require("@prisma/client");
const { promises: fs } = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(process.cwd(), "emailDetails.json");

  const emailDetailsRaw = await fs.readFile(filePath, "utf-8");
  const emailDetails = JSON.parse(emailDetailsRaw).slice(0, 5);
  console.log("EMAIL DETAILS (length): ", emailDetails.length);

  const integrations = await prisma.integration.findUnique({
    where: {
      email: "falahsss900@gmail.com",
    },
  });

  if (!integrations) {
    throw new Error("Integration not found for the given email.");
  }

  console.log("Integrations:", integrations);

  for (const email of emailDetails) {
    await prisma.mail.create({
      data: {
        from: email.from,
        to: email.to,
        cc: email.cc,
        bcc: email.bcc,
        date: email.date ? new Date(email.date) : null,
        subject: email.subject,
        messageId: email.messageId,
        replyTo: email.replyTo,
        snippet: email.snippet,
        threadId: email.threadId,
        plainTextMessage: email.plainTextMessage,
        htmlMessage: email.htmlMessage,
        labelIds: email.labelIds,
        priorityGrade: email.priorityGrade,
        categorization: email.categorization
          ? {
              primaryCategory: email.categorization.primaryCategory,
              subCategory: email.categorization.subCategory,
              confidence: email.categorization.confidence,
            }
          : undefined,
        nlpEntities: email.nlpEntities,
        sentimentScore: email.sentimentScore,
        privacyCompliant: email.privacyCompliant,
        category: email.category,
        integrationId: integrations.id,
        attachments: {
          create: email.attachments.map((attachment: any) => ({
            filename: attachment.filename,
            mimeType: attachment.mimeType,
            data: attachment.data,
          })),
        },
      },
    });
  }

  console.log("Seeding completed successfully.");
}

// Run the seeding script
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
