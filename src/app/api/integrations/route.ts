import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const GET = async (req: NextRequest) => {
  try {
    // Retrieve the auth token from the request headers
    const authToken = req.headers.get("auth");

    if (!authToken) {
      return NextResponse.json(
        { error: "Authorization token is missing" },
        { status: 400 }
      );
    }

    // Find the user by auth token
    const user = await prisma.user.findFirst({
      where: {
        authToken,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch all integrations for the user
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
