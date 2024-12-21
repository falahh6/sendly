import { NextResponse } from "next/server";
import { gmail_v1, google } from "googleapis";
import { parseEmail } from "@/lib/emails/utils";
import { Email } from "@/lib/types/email";
import prisma from "@/lib/prisma";
import { Integration } from "@prisma/client";
import { pusherServer } from "@/lib/pusher";

export async function POST(request: Request) {
  const body = await request.json();
  console.log("Body: ", body);

  const decodedData = JSON.parse(
    Buffer.from(body.message.data, "base64").toString("utf-8")
  );

  try {
    if (!decodedData.emailAddress || !decodedData.historyId) {
      return NextResponse.json(
        { error: "Email address or history ID not provided" },
        { status: 400 }
      );
    }

    const integration = await prisma.integration.findFirst({
      where: {
        email: decodedData.emailAddress,
      },
    });

    const profileData = integration?.profile as Record<
      string,
      string | number | boolean
    >;

    if (!integration) {
      return NextResponse.json(
        { error: "Integration not found" },
        { status: 404 }
      );
    }

    const oauth2Client = getOAuthClient(integration);
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const historyData = await gmail.users.history.list({
      userId: "me",
      startHistoryId: profileData.historyId as string,
    });

    const historyRecords = historyData.data.history || [];

    for (const record of historyRecords) {
      if (record.messagesAdded) {
        for (const msg of record.messagesAdded) {
          if (msg.message?.id)
            await handleNewMessage(gmail, integration.id, msg.message.id);
        }
      }

      if (record.messagesDeleted) {
        for (const msg of record.messagesDeleted) {
          if (msg.message?.id) await handleDeletedMessage(msg.message.id);
        }
      }

      if (record.labelsAdded) {
        for (const msg of record.labelsAdded) {
          if (msg.message?.id) await handleLabelChange(gmail, msg.message.id);
        }
      }

      if (record.labelsRemoved) {
        for (const msg of record.labelsRemoved) {
          if (msg.message?.id) await handleLabelChange(gmail, msg.message.id);
        }
      }
    }

    pusherServer.trigger("gmail-channel", "new-email", {
      body: "email updates",
    });

    await updateIntegrationHistoryId(
      integration.id,
      historyData.data.historyId!
    );

    return NextResponse.json(
      { success: true },
      {
        status: 200,
      }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Error processing notification : " + (error as Error)?.message },
      { status: 200 }
    );
  }
}

const getOAuthClient = (integration: Integration) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CID,
    process.env.GOOGLE_CS
  );

  oauth2Client.setCredentials({
    access_token: integration.accessToken,
    refresh_token: integration.refreshToken,
  });

  return oauth2Client;
};

const fetchEmailDetails = async (gmail: gmail_v1.Gmail, messageId: string) => {
  const emailResponse = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
  });
  return parseEmail(emailResponse.data as Email);
};

const handleNewMessage = async (
  gmail: gmail_v1.Gmail,
  integrationId: number,
  messageId: string
) => {
  const parsedEmail = await fetchEmailDetails(gmail, messageId);

  await prisma.mail.create({
    data: {
      from: parsedEmail.from,
      to: parsedEmail.to,
      cc: parsedEmail.cc,
      bcc: parsedEmail.bcc,
      date: parsedEmail.date ? new Date(parsedEmail.date) : undefined,
      subject: parsedEmail.subject,
      messageId,
      replyTo: parsedEmail.replyTo,
      snippet: parsedEmail.snippet,
      threadId: parsedEmail.threadId,
      plainTextMessage: parsedEmail.plainTextMessage,
      htmlMessage: parsedEmail.htmlMessage,
      labelIds: parsedEmail.labelIds,
      priorityGrade: parsedEmail.priorityGrade,
      integrationId,
      attachments: {
        create: parsedEmail.attachments.map((attachment) => ({
          filename: attachment.filename,
          mimeType: attachment.mimeType,
          data: attachment.data,
        })),
      },
    },
  });
};

const handleDeletedMessage = async (messageId: string) => {
  await prisma.mail.deleteMany({
    where: { messageId },
  });
};

const handleLabelChange = async (gmail: gmail_v1.Gmail, messageId: string) => {
  const emailResponse = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
  });

  const updatedLabels = emailResponse.data.labelIds || [];
  await prisma.mail.updateMany({
    where: { messageId },
    data: { labelIds: updatedLabels },
  });
};

const updateIntegrationHistoryId = async (
  integrationId: number,
  newHistoryId: string
) => {
  await prisma.integration.update({
    where: { id: integrationId },
    data: {
      profile: {
        historyId: newHistoryId,
      },
    },
  });
};
