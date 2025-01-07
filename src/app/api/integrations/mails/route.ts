import { evervault } from "@/lib/evervault";
import prisma from "@/lib/prisma";
import { ParsedEmail } from "@/lib/types/email";
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
        const decryptedFields: ParsedEmail = await evervault.decrypt(email);
        return {
          id: email.id,
          from: decryptedFields.from,
          to: decryptedFields.to,
          cc: decryptedFields.cc || null,
          bcc: decryptedFields.bcc || null,
          subject: decryptedFields.subject,
          date: email.date,
          messageId: email.id,
          replyTo: decryptedFields.replyTo || null,
          snippet: decryptedFields.snippet,
          threadId: decryptedFields.threadId,
          plainTextMessage: decryptedFields.plainTextMessage,
          htmlMessage: decryptedFields.htmlMessage,
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
