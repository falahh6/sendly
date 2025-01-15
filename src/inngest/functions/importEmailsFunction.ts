import { inngest } from "../client";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import prisma from "@/lib/prisma";
import { parseEmail } from "@/lib/emails/utils";
import { Email, ParsedEmail } from "@/lib/types/email";
import { evervault } from "@/lib/evervault";
import { ablyServer } from "@/lib/ably";

type ProfileData = string | number | boolean;

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CID,
  process.env.GOOGLE_CS,
  process.env.GOOGLE_REDIRECT_URI
);

export const importEmailsFunction = inngest.createFunction(
  { id: "import-emails", name: "Import Emails" },
  { event: "email.import" },
  async ({ event, step }) => {
    const { integrationId } = event.data;

    const channel = ablyServer.channels.get(`gmail-channel-${integrationId}`);

    console.log("channel : ", channel);

    const integration = await prisma.integration.findFirst({
      where: { id: integrationId },
    });

    console.log("Integration :  ", integration);

    if (!integration) {
      await channel.publish("mail-import", {
        message: "No integration found",
      });
      return {
        error: "No integration found",
      };
    }

    const profile = integration.profile as Record<string, ProfileData>;

    if (profile?.isComplete) {
      await channel.publish("mail-import", {
        message: "Import already completed",
      });
      return { error: "Import completed" };
    }

    oauth2Client.setCredentials({
      access_token: await evervault.decrypt(integration.accessToken),
      refresh_token: await evervault.decrypt(
        integration.refreshToken ?? undefined
      ),
    });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const messages = await step.run("fetch-email-messages", async () => {
      const msgs = [];
      let response = await gmail.users.messages.list({
        userId: "me",
        maxResults: 500,
        q: "",
        includeSpamTrash: true,
      });

      if (response.data.messages) {
        msgs.push(...response.data.messages);
      }

      while (response.data.nextPageToken) {
        response = await gmail.users.messages.list({
          userId: "me",
          maxResults: 500,
          pageToken: response.data.nextPageToken,
        });

        if (response.data.messages) {
          msgs.push(...response.data.messages);
        }
      }
      return msgs;
    });

    await step.run("import-started", async () => {
      await channel.publish("mail-import", {
        message: "Import started",
        totalEmails: messages.length,
      });
    });

    await step.run("update-integration-profile", async () => {
      await prisma.integration.update({
        where: { id: integration.id },
        data: {
          profile: {
            ...profile,
            lastImportedAt: new Date(),
            totalEmails: messages.length,
            isImportProcessing: true,
          },
        },
      });
    });

    console.log("PROFILE : ", profile);
    const batchSize = 20;
    let importedCount = profile.emailImportedCount ?? 0;
    console.log("Imported Count : ", importedCount);

    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      await step.run(`import-email-batch-${i / batchSize + 1}`, async () => {
        for (const message of batch) {
          try {
            const emailResponse = await gmail.users.messages.get({
              userId: "me",
              id: message.id as string,
              format: "full",
            });

            const parsedEmail = parseEmail(emailResponse.data as Email);

            const encryptedEmail: ParsedEmail = await evervault.encrypt(
              parsedEmail
            );

            console.log("Encrypted Email : ", encryptedEmail);

            await prisma.mail.create({
              data: {
                from: encryptedEmail.from,
                to: encryptedEmail.to,
                cc: encryptedEmail.cc,
                bcc: encryptedEmail.bcc,
                date: parsedEmail.date ? new Date(parsedEmail.date) : undefined,
                subject: encryptedEmail.subject,
                messageId: message.id,
                replyTo: encryptedEmail.replyTo,
                snippet: encryptedEmail.snippet,
                threadId: encryptedEmail.threadId,
                plainTextMessage: encryptedEmail.plainTextMessage,
                htmlMessage: encryptedEmail.htmlMessage,
                labelIds: parsedEmail.labelIds,
                priorityGrade: parsedEmail.priorityGrade,
                integrationId,
                attachments: {
                  create: encryptedEmail.attachments.map((attachment) => ({
                    filename: attachment.filename,
                    mimeType: attachment.mimeType,
                    data: attachment.data,
                  })),
                },
              },
            });

            if (typeof importedCount === "number") {
              importedCount++;
            }

            await prisma.integration.update({
              where: { id: integration.id },
              data: {
                profile: {
                  ...profile,
                  lastImportCompletedAt: new Date(),
                  isImportProcessing: true,
                  emailImportedCount: importedCount,
                },
              },
            });

            await channel.publish("mail-import", {
              body: {
                importedEmailCount: importedCount,
                totalEmails: messages.length,
              },
              message: "Import in progress",
            });
          } catch (emailError) {
            console.error(`Failed to import email ${message.id}:`, emailError);

            await channel.publish("mail-import-error", {
              messageId: message.id,
              error:
                emailError instanceof Error
                  ? emailError.message
                  : "Unknown error",
            });
          }
        }
      });
    }

    await step.run("finalize-import", async () => {
      await prisma.integration.update({
        where: { id: integration.id },
        data: {
          profile: {
            ...profile,
            importComplete: true,
            lastImportCompletedAt: new Date(),
            isImportProcessing: false,
          },
        },
      });

      await channel.publish("mail-import", {
        body: {
          importedEmailCount: importedCount,
          totalEmails: messages.length,
        },
        message: "Import completed",
      });
    });

    return { message: "Import complete" };
  }
);
