import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const GET = async (req: NextRequest) => {
  try {
    const authToken = req.headers.get("auth");

    if (!authToken) {
      return NextResponse.json(
        { error: "Authorization token is missing" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        authToken,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const integrations = await prisma.integration.findMany({
      where: {
        userId: user.id,
      },
    });

    return NextResponse.json({ integrations }, { status: 200 });
  } catch (error) {
    console.error("Error fetching integrations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

export const DELETE = async (req: NextRequest) => {
  try {
    const authToken = req.headers.get("auth");

    if (!authToken) {
      return NextResponse.json(
        { error: "Authorization token is missing" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        authToken,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const params = new URL(req.url).searchParams;
    const integrationId = params.get("integrationId");

    if (!integrationId) {
      return NextResponse.json(
        { error: "Integration ID is required" },
        { status: 400 }
      );
    }

    await prisma.integration.delete({
      where: {
        id: Number(integrationId),
      },
    });

    return NextResponse.json(
      { message: `Integration and mails deleted` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting integration:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
