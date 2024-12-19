import { NextResponse } from "next/server";
import { google } from "googleapis";
import { parseEmail } from "@/lib/emails/utils";
import { Email } from "@/lib/types/email";
import prisma from "@/lib/prisma";

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
        { status: 400 }
      );
    }

    const integration = await prisma.integration.findFirst({
      where: {
        email: decodedData.emailAddress,
      },
    });

    console.log("Integration: ", integration);

    if (!integration) {
      return NextResponse.json(
        { error: "Integration not found" },
        { status: 404 }
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CID,
      process.env.GOOGLE_CS
    );

    oauth2Client.setCredentials({
      access_token: integration.accessToken,
      refresh_token: integration.refreshToken,
    });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const latestMessages = await gmail.users.messages.list({
      userId: "me",
      maxResults: 4,
    });

    console.log("latest message response :  ", latestMessages);

    const messageIds = await prisma.mail.findMany({
      where: {
        integrationId: integration.id,
      },
      select: {
        messageId: true,
      },
    });

    for (const message of latestMessages.data.messages ?? []) {
      if (!messageIds.flatMap((m) => m.messageId).includes(message.id!)) {
        const emailResponse = await gmail.users.messages.get({
          userId: "me",
          id: message.id!,
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

        console.log(
          "Email created -> ",
          parsedEmail.from,
          " || ",
          parsedEmail.subject
        );
      }
    }

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
