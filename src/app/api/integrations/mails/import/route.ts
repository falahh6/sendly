// app/api/gmail-import/route.ts
import { NextRequest, NextResponse } from "next/server";
import { gmail_v1, google } from "googleapis";
import { PrismaClient } from "@prisma/client";
import { OAuth2Client } from "google-auth-library";
import { parseEmail } from "@/lib/emails/utils";

interface Email {
  id: string;
  threadId: string;
  snippet: string;
  labelIds: string[];
  payload: {
    headers: Array<{ name: string; value: string }>;
    parts?: Array<{
      partId: string;
      mimeType: string;
      headers: Array<{ name: string; value: string }>;
      body?: {
        size: number;
        data?: string;
      };
      filename?: string;
    }>;
  };
}

const prisma = new PrismaClient();

// Configure OAuth2 client
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CID,
  process.env.GOOGLE_CS,
  process.env.GOOGLE_REDIRECT_URI
);

export async function GET(request: NextRequest) {
  try {
    const params = new URL(request.url).searchParams;
    const integrationId = params.get("integrationId");
    // Get the integration from the database (assuming you want to use an existing integration)
    const integration = await prisma.integration.findFirst({
      where: { id: Number(integrationId) },
    });

    console.log("Integration", integration);

    if (!integration) {
      return NextResponse.json(
        {
          error: "No Gmail integration found",
        },
        { status: 404 }
      );
    }

    oauth2Client.setCredentials({
      access_token: integration.accessToken,
      refresh_token: integration.refreshToken || undefined,
    });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const response = await gmail.users.messages.list({
      userId: "me",
      maxResults: 500,
    });

    const messages = response.data.messages || [];

    const importJob = await prisma.integration.update({
      where: { id: integration.id },
      data: {
        profile: {
          lastImportedAt: new Date(),
          totalEmailsToImport: messages.length,
        },
      },
    });

    importEmailsInBackground(integration.id, messages);

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

    const profile = integration.profile as Record<
      string,
      string | number | boolean
    >;
    console.log("PROFILE : ", profile);

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
  messages: gmail_v1.Schema$Message[]
) {
  const integration = await prisma.integration.findUnique({
    where: { id: integrationId },
  });

  if (!integration) {
    console.error("Integration not found");
    return;
  }

  oauth2Client.setCredentials({
    access_token: integration.accessToken,
    refresh_token: integration.refreshToken || undefined,
  });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  try {
    let importedCount = 0;

    for (const message of messages) {
      try {
        const updatedIntegration = await prisma.integration.findUnique({
          where: { id: integrationId },
        });

        const profile = updatedIntegration?.profile as Record<
          string,
          string | number | boolean
        >;
        if (profile?.isImportCanceled) {
          console.log(
            `Import process canceled for integration ID: ${integrationId}`
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

        await prisma.integration.update({
          where: { id: integrationId },
          data: {
            profile: {
              ...profile,
              importedEmailCount: importedCount,
              importComplete: importedCount === messages.length,
            },
          },
        });
      } catch (emailError) {
        console.error(`Failed to import email ${message.id}:`, emailError);
      }
    }

    await prisma.integration.update({
      where: { id: integrationId },
      data: {
        profile: {
          importComplete: true,
          lastImportCompletedAt: new Date(),
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

    await prisma.integration.update({
      where: { id: Number(integrationId) },
      data: {
        profile: {
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
