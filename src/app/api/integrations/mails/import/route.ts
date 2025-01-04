import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import prisma from "@/lib/prisma";
import { inngest } from "@/inngest/client";
import { evervault } from "@/lib/evervault";

type ProfileData = string | number | boolean;

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CID,
  process.env.GOOGLE_CS,
  process.env.GOOGLE_REDIRECT_URI
);

const isTesting = false;

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

    const tokens = {
      access_token: await evervault.decrypt(integration.accessToken),
      refresh_token: await evervault.decrypt(integration.refreshToken ?? ""),
    };

    console.log("Tokens (import): ", tokens);

    oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const messages = [];

    let response = await gmail.users.messages.list({
      userId: "me",
      maxResults: isTesting ? 10 : 500,
      q: "",
      includeSpamTrash: true,
    });

    if (response.data.messages) {
      messages.push(...response.data.messages);
    }

    while (response.data.nextPageToken && !isTesting) {
      response = await gmail.users.messages.list({
        userId: "me",
        maxResults: 500,
        pageToken: response.data.nextPageToken,
      });

      if (response.data.messages) {
        messages.push(...response.data.messages);
      }
    }

    await inngest.send({
      name: "email.import",
      data: { integrationId: integration.id },
    });

    return NextResponse.json({
      jobId: integrationId,
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
