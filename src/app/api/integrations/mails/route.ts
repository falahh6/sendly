import { evervault } from "@/lib/evervault";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const authToken = request.headers.get("auth");
  if (!authToken) {
    return NextResponse.json(
      { error: "Authorization token not provided" },
      { status: 401 }
    );
  }

  const params = new URL(request.url).searchParams;
  const integrationId = params.get("integration_id");

  if (!integrationId) {
    return NextResponse.json(
      { error: "Integration ID not provided" },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        authToken: authToken,
      },
    });
    console.log("USER", user);

    const page = parseInt(params.get("page") ?? "1", 10);
    const pageSize = parseInt(params.get("pageSize") ?? "50", 10);
    const skip = (page - 1) * pageSize;

    const mails = await prisma.mail.findMany({
      where: {
        integrationId: Number(integrationId),
      },
      take: pageSize,
      skip: skip,
      include: {
        attachments: true,
      },
    });

    const totalMails = await prisma.mail.count({
      where: {
        integrationId: Number(integrationId),
      },
    });

    const totalPages = Math.ceil(totalMails / pageSize);

    const decryptedEmails = await Promise.all(
      mails.map(async (email) => {
        const encryptedFields = [
          email.from,
          email.to,
          email.cc,
          email.bcc,
          email.subject,
          email.messageId,
          email.replyTo,
          email.snippet,
          email.threadId,
          email.plainTextMessage,
          email.htmlMessage,
          ...email.attachments.map((attachment) => [
            attachment.filename,
            attachment.mimeType,
            attachment.data,
          ]),
        ].flat();

        const decryptedFields = await evervault.decrypt(encryptedFields);

        let index = 0;
        return {
          id: email.id,
          from: decryptedFields[index++],
          to: decryptedFields[index++],
          cc: decryptedFields[index++] || null,
          bcc: decryptedFields[index++] || null,
          date: email.date,
          subject: decryptedFields[index++],
          messageId: decryptedFields[index++],
          replyTo: decryptedFields[index++] || null,
          snippet: decryptedFields[index++],
          threadId: decryptedFields[index++],
          plainTextMessage: decryptedFields[index++],
          htmlMessage: decryptedFields[index++],
          labelIds: email.labelIds,
          priorityGrade: email.priorityGrade,
          integrationId: email.integrationId,
          attachments: email.attachments.map((attachment) => ({
            filename: attachment.filename,
            mimeType: attachment.mimeType,
            data: attachment.data,
          })),
        };
      })
    );

    return NextResponse.json(
      {
        mails: decryptedEmails,
        pagination: {
          totalMails,
          totalPages,
          currentPage: page,
          pageSize,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching mails:", error);
    return NextResponse.json(
      { error: "Failed to fetch mails" },
      { status: 500 }
    );
  }
}
