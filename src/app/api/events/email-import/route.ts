import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  let streamClosed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const interval = setInterval(async () => {
        if (streamClosed) return;

        try {
          const integration = await prisma.integration.findUnique({
            where: { id: Number(integrationId) },
          });

          if (!integration) {
            controller.enqueue(
              `data: ${JSON.stringify({ error: "Integration not found" })}\n\n`
            );
            cleanupStream(controller, interval);
            return;
          }

          const profile = integration.profile as Record<
            string,
            string | number | boolean
          >;

          const importedCount = profile.importedEmailCount || 0;
          const totalEmails = profile.totalEmailsToImport || 0;

          if (profile?.isImportCanceled) {
            if (!streamClosed) {
              controller.enqueue(
                `data: ${JSON.stringify({
                  importedCount,
                  totalEmails,
                  isComplete: true,
                  isCancelled: true,
                })}\n\n`
              );
            }
            cleanupStream(controller, interval);
            return;
          }

          if (profile?.importComplete) {
            if (!streamClosed) {
              controller.enqueue(
                `data: ${JSON.stringify({
                  importedCount,
                  totalEmails,
                  isComplete: true,
                })}\n\n`
              );
            }
            cleanupStream(controller, interval);
            return;
          }

          if (streamClosed == false) {
            controller.enqueue(
              `data: ${JSON.stringify({
                importedCount,
                totalEmails,
                isComplete: false,
              })}\n\n`
            );
          }
        } catch (error) {
          controller.enqueue(`data: ${JSON.stringify({ error: error })}\n\n`);
          cleanupStream(controller, interval);
        }
      }, 1000);

      abortController.signal.addEventListener("abort", () => {
        cleanupStream(controller, interval);
      });
    },
  });

  return new NextResponse(stream, { headers });

  function cleanupStream(
    controller: ReadableStreamDefaultController<Uint8Array>,
    interval: NodeJS.Timeout
  ) {
    if (!streamClosed) {
      clearInterval(interval);
      streamClosed = true;
      controller.close();
    }
  }
}
