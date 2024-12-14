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

    const mails = await prisma.mail.findMany({
      where: {
        integrationId: Number(integrationId),
      },
    });

    console.log("MAILS", mails.length);

    return NextResponse.json(mails, { status: 200 });
  } catch (error) {
    console.error("Error fetching mails:", error);
    return NextResponse.json(
      { error: "Failed to fetch mails" },
      { status: 500 }
    );
  }
}
