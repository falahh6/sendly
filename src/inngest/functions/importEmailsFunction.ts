import { inngest } from "../client";
import { gmail_v1, google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import prisma from "@/lib/prisma";
import { parseEmail } from "@/lib/emails/utils";
import { Email } from "@/lib/types/email";
import { pusherServer } from "@/lib/pusher";

type ProfileData = string | number | boolean;

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CID,
  process.env.GOOGLE_CS,
  process.env.GOOGLE_REDIRECT_URI
);

export const importEmailsFunction = inngest.createFunction(
  { id: "import-emails", name: "Import Emails" },
  { event: "email.import" },
  async ({ event }) => {
    console.log("Import Emails Function : data :", event.data);
    const { integrationId } = event.data;

    const integration = await prisma.integration.findFirst({
      where: { id: integrationId },
    });

    if (!integration) {
      return {
        error: "No integration found",
      };
    }

    const profile = integration.profile as Record<string, ProfileData>;

    if (profile.isComplete)
      return {
        error: "Import completed",
      };

    oauth2Client.setCredentials({
      access_token: integration.accessToken,
      refresh_token: integration.refreshToken ?? undefined,
    });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const messages = [];

    let response = await gmail.users.messages.list({
      userId: "me",
      maxResults: 500,
      q: "",
      includeSpamTrash: true,
    });

    if (response.data.messages) {
      messages.push(...response.data.messages);
    }

    while (response.data.nextPageToken) {
      response = await gmail.users.messages.list({
        userId: "me",
        maxResults: 1,
        pageToken: response.data.nextPageToken,
      });

      if (response.data.messages) {
        messages.push(...response.data.messages);
      }
    }

    const importJob = await prisma.integration.update({
      where: { id: integration.id },
      data: {
        profile: {
          ...profile,
          lastImportedAt: new Date(),
          totalEmailsToImport: messages.length,
        },
      },
    });

    const profileData = importJob.profile as Record<string, ProfileData>;

    if (profileData.importedEmailCount) {
      importEmailsInBackground(
        integration.id,
        messages.slice(
          profileData.importedEmailCount as number,
          messages.length
        ),
        profileData.importedEmailCount as number
      );
    } else {
      importEmailsInBackground(integration.id, messages);
    }
  }
);

async function importEmailsInBackground(
  integrationId: number,
  messages: gmail_v1.Schema$Message[],
  lastImportedCount?: number
) {
  let integration = await prisma.integration.findUnique({
    where: { id: integrationId },
  });

  console.log(
    `Importing emails for integration (importEmailsInBackground) : ${integrationId}`
  );

  pusherServer.trigger(`gmail-channel-${integrationId}`, "mail-import", {
    message: "Import Started",
  });

  const profile = integration?.profile as Record<string, ProfileData>;

  console.log("Profile (importEmailsInBackground) : ", profile);

  if (profile?.shouldImportStart) {
    console.error("Import process should not be started");
  }

  if (!integration) {
    console.error("Integration not found");
    return;
  }

  oauth2Client.setCredentials({
    access_token: integration.accessToken,
    refresh_token: integration.refreshToken ?? undefined,
  });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  try {
    let importedCount = lastImportedCount ?? 0;

    for (const message of messages) {
      try {
        console.log(`Importing email ${message.id}`);
        const updatedIntegration = await prisma.integration.findUnique({
          where: { id: integrationId },
        });

        let profile = updatedIntegration?.profile as Record<
          string,
          ProfileData
        >;

        if (profile?.isImportCancelled) {
          console.log(
            `Import process canceled for integration : ${integrationId}`
          );
          return;
        }

        const emailResponse = await gmail.users.messages.get({
          userId: "me",
          id: message.id as string,
          format: "full",
        });

        const parsedEmail = parseEmail(emailResponse.data as Email);

        await prisma.mail.create({
          data: {
            from: parsedEmail.from,
            to: parsedEmail.to,
            cc: parsedEmail.cc,
            bcc: parsedEmail.bcc,
            date: parsedEmail.date ? new Date(parsedEmail.date) : undefined,
            subject: parsedEmail.subject,
            messageId: message.id,
            replyTo: parsedEmail.replyTo,
            snippet: parsedEmail.snippet,
            threadId: parsedEmail.threadId,
            plainTextMessage: parsedEmail.plainTextMessage,
            htmlMessage: parsedEmail.htmlMessage,
            labelIds: parsedEmail.labelIds,
            priorityGrade: parsedEmail.priorityGrade,
            integrationId: integration.id,
            attachments: {
              create: parsedEmail.attachments.map((attachment) => ({
                filename: attachment.filename,
                mimeType: attachment.mimeType,
                data: attachment.data,
              })),
            },
          },
        });

        importedCount++;

        pusherServer.trigger(`gmail-channel-${integrationId}`, "mail-import", {
          body: {
            totalEmails: messages.length,
            importedEmailCount: importedCount,
            importComplete: importedCount === messages.length,
          },
          message: "Import in Progress",
        });

        profile = integration?.profile as Record<string, ProfileData>;
        integration = await prisma.integration.update({
          where: { id: integrationId },
          data: {
            profile: {
              ...profile,
              importedEmailCount: importedCount,
              importComplete: importedCount === messages.length,
              isImportProcessing: true,
            },
          },
        });
      } catch (emailError) {
        console.error(`Failed to import email ${message.id}:`, emailError);
      }
    }
    const profile = integration?.profile as Record<
      string,
      string | number | boolean
    >;
    await prisma.integration.update({
      where: { id: integrationId },
      data: {
        profile: {
          ...profile,
          importComplete: true,
          lastImportCompletedAt: new Date(),
          isImportProcessing: false,
        },
      },
    });

    return {
      message: "Import complete",
    };
  } catch (error) {
    console.error("Email import failed:", error);

    await prisma.integration.update({
      where: { id: integrationId },
      data: {
        profile: {
          importComplete: false,
          importError: error instanceof Error ? error.message : "Unknown error",
        },
      },
    });
  }
}
