import { NextRequest, NextResponse } from "next/server";
import { gmail_v1, google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { parseEmail } from "@/lib/emails/utils";
import { Email } from "@/lib/types/email";
import prisma from "@/lib/prisma";

type ProfileData = string | number | boolean;

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CID,
  process.env.GOOGLE_CS,
  process.env.GOOGLE_REDIRECT_URI
);

const isTesting = true;

export async function GET(request: NextRequest) {
  try {
    const params = new URL(request.url).searchParams;

    const integrationId = params.get("integrationId");
    const startImport = params.get("startImport");

    const integration = await prisma.integration.findFirst({
      where: { id: Number(integrationId) },
    });

    if (!startImport || startImport === "false") {
      return NextResponse.json({
        message: "Import process not started",
      });
    }

    if (!integration) {
      return NextResponse.json(
        {
          error: "No Gmail integration found",
        },
        { status: 404 }
      );
    }

    const profile = integration.profile as Record<string, ProfileData>;

    if (profile.isComplete) {
      return NextResponse.json(
        {
          error: "Import completed",
        },
        { status: 404 }
      );
    }

    oauth2Client.setCredentials({
      access_token: integration.accessToken,
      refresh_token: integration.refreshToken ?? undefined,
    });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const messages = [];

    let response = await gmail.users.messages.list({
      userId: "me",
      maxResults: isTesting ? 10 : 500,
    });

    if (response.data.messages) {
      messages.push(...response.data.messages);
    }

    while (response.data.nextPageToken && !isTesting) {
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

    return NextResponse.json({
      jobId: importJob.id,
      totalEmails: messages.length,
      message: "Email import started",
    });
  } catch (error) {
    console.error("Failed to start email import:", error);
    return NextResponse.json(
      {
        error: "Failed to start email import",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { integrationId } = await request.json();

  try {
    const integration = await prisma.integration.findUnique({
      where: { id: integrationId },
    });

    if (!integration) {
      return NextResponse.json(
        {
          error: "Integration not found",
        },
        { status: 404 }
      );
    }

    const profile = integration.profile as Record<string, ProfileData>;

    if (!profile?.totalEmailsToImport) {
      return NextResponse.json({
        message: "Import not started",
      });
    }

    return NextResponse.json({
      integrationId: integration.id,
      totalEmails: profile.totalEmailsToImport || 0,
      importedCount: profile.importedEmailCount || 0,
      isComplete: profile.importComplete || false,
    });
  } catch (error) {
    console.error("Failed to check import status:", error);
    return NextResponse.json(
      {
        error: "Failed to check import status",
      },
      { status: 500 }
    );
  }
}

async function importEmailsInBackground(
  integrationId: number,
  messages: gmail_v1.Schema$Message[],
  lastImportedCount?: number
) {
  let integration = await prisma.integration.findUnique({
    where: { id: integrationId },
  });

  const profile = integration?.profile as Record<string, ProfileData>;

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
        const updatedIntegration = await prisma.integration.findUnique({
          where: { id: integrationId },
        });

        let profile = updatedIntegration?.profile as Record<
          string,
          ProfileData
        >;

        if (profile?.isImportCanceled) {
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
            messageId: parsedEmail.messageId,
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

export async function DELETE(request: NextRequest) {
  try {
    const params = new URL(request.url).searchParams;
    const integrationId = params.get("integrationId");

    if (!integrationId) {
      return NextResponse.json(
        { error: "Integration ID is required" },
        { status: 400 }
      );
    }

    const integration = await prisma.integration.findUnique({
      where: { id: Number(integrationId) },
    });

    const profile = integration?.profile as Record<
      string,
      string | number | boolean
    >;

    await prisma.integration.update({
      where: { id: Number(integrationId) },
      data: {
        profile: {
          ...profile,
          isImportCanceled: true,
        },
      },
    });

    return NextResponse.json({
      message: "Import process canceled",
    });
  } catch (error) {
    console.error("Failed to cancel import:", error);
    return NextResponse.json(
      { error: "Failed to cancel import" },
      { status: 500 }
    );
  }
}
