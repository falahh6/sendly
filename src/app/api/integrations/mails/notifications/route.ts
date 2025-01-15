import { NextResponse } from "next/server";
import { gmail_v1, google } from "googleapis";
import { parseEmail } from "@/lib/emails/utils";
import { Email, ParsedEmail } from "@/lib/types/email";
import prisma from "@/lib/prisma";
import { Integration } from "@prisma/client";
import { evervault } from "@/lib/evervault";
import { ablyServer } from "@/lib/ably";

export async function POST(request: Request) {
  const body = await request.json();
  console.log("Body: ", body);

  const decodedData = JSON.parse(
    Buffer.from(body.message.data, "base64").toString("utf-8")
  );

  console.log("Decoded Data: ", decodedData);

  try {
    if (!decodedData.emailAddress || !decodedData.historyId) {
      return NextResponse.json(
        { error: "Email address or history ID not provided" },
        { status: 200 }
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
        { status: 200 }
      );
    }

    const oauth2Client = getOAuthClient(integration);
    const gmail = google.gmail({ version: "v1", auth: await oauth2Client });

    const historyData = await gmail.users.history.list({
      userId: "me",
      startHistoryId: profileData.historyId as string,
    });

    const historyRecords = historyData.data.history || [];

    console.log("History Records: ", historyRecords);

    if (historyRecords.length !== 0) {
      const channel = ablyServer.channels.get(
        `gmail-channel-${integration.id}`
      );
      await channel.publish("new-email", {
        body: "email updates",
      });
    }

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

    await updateIntegrationHistoryId(
      integration.id,
      profileData,
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

const getOAuthClient = async (integration: Integration) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CID,
    process.env.GOOGLE_CS
  );

  oauth2Client.setCredentials({
    access_token: await evervault.decrypt(integration.accessToken),
    refresh_token: await evervault.decrypt(integration.refreshToken),
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
  const existingEmail = await prisma.mail.findFirst({
    where: {
      messageId,
    },
  });

  if (existingEmail) {
    return;
  }

  const parsedEmail = await fetchEmailDetails(gmail, messageId);
  const encryptedEmail: ParsedEmail = await evervault.encrypt(parsedEmail);

  await prisma.mail.create({
    data: {
      from: encryptedEmail.from,
      to: encryptedEmail.to,
      cc: encryptedEmail.cc,
      bcc: encryptedEmail.bcc,
      date: parsedEmail.date ? new Date(parsedEmail.date) : undefined,
      subject: encryptedEmail.subject,
      messageId: messageId,
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
  profileData: Record<string, string | number | boolean>,
  newHistoryId: string
) => {
  await prisma.integration.update({
    where: { id: integrationId },
    data: {
      profile: {
        ...profileData,
        historyId: newHistoryId,
      },
    },
  });
};
