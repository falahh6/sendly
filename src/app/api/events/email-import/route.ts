import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const params = new URL(request.url).searchParams;
  const integrationId = params.get("integrationId");

  if (!integrationId) {
    return NextResponse.json(
      { error: "Integration ID is required" },
      { status: 400 }
    );
  }

  const headers = new Headers({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const abortController = new AbortController();

  const stream = new ReadableStream({
    async start(controller) {
      const interval = setInterval(async () => {
        try {
          const integration = await prisma.integration.findUnique({
            where: { id: Number(integrationId) },
          });

          if (!integration) {
            controller.enqueue(
              `data: ${JSON.stringify({ error: "Integration not found" })}\n\n`
            );
            controller.close();
            clearInterval(interval);
            return;
          }

          const profile = integration.profile as Record<
            string,
            string | number | boolean
          >;
          const importedCount = profile.importedEmailCount || 0;
          const totalEmails = profile.totalEmailsToImport || 0;

          if (profile.importComplete) {
            if (controller.desiredSize !== null) {
              controller.enqueue(
                `data: ${JSON.stringify({
                  importedCount,
                  totalEmails,
                  isComplete: true,
                })}\n\n`
              );
              controller.close();
            }

            clearInterval(interval);
            return;
          }

          controller.enqueue(
            `data: ${JSON.stringify({
              importedCount,
              totalEmails,
              isComplete: false,
            })}\n\n`
          );
        } catch (error) {
          controller.enqueue(`data: ${JSON.stringify({ error: error })}\n\n`);
          controller.close();
          clearInterval(interval);
        }
      }, 1000);

      abortController.signal.addEventListener("abort", () => {
        controller.close();
        clearInterval(interval);
      });
    },
  });

  return new NextResponse(stream, { headers });
}
